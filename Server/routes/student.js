import express from 'express';
import { Student } from '../models/Student.js';
import crypto from 'crypto';
const router = express.Router();
import { verifyAdmin } from './auth.js';

// Use crypto.pbkdf2 for better password hashing with salt and iterations
async function hashPassword(password, salt) {
    const iterations = 100000;
    const keyLength = 64;
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey.toString('hex'));
        });
    });
}

// Admin-only route to register a new student
router.post('/register', verifyAdmin, async (req, res) => {
    try {
        const { username, password, roll, grade, contact, email } = req.body;

        // Validate required fields
        if (!username || !password || !roll || !grade || !contact || !email) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if the username or email is already in use
        const existingStudent = await Student.findOne({ 
            $or: [{ username }, { email }]
        });
        if (existingStudent) {
            const conflictField = existingStudent.username === username ? "username" : "email";
            return res.status(400).json({ message: `Student with this ${conflictField} is already registered` });
        }

        // Generate a salt for password hashing
        const salt = crypto.randomBytes(16).toString('hex');

        // Hash the password with the generated salt
        const hashedPassword = await hashPassword(password, salt);

        // Create a new student entry
        const newStudent = new Student({
            username,
            password: hashedPassword, // Store the hashed password
            salt, // Store the salt to use when verifying the password
            roll,
            grade,
            contact,
            email // Add email to the schema
        });

        // Save the new student to the database
        await newStudent.save();

        return res.json({ registered: true, message: "Student successfully registered" });
    } catch (err) {
        console.error("Error registering student:", err); // Log the error for debugging
        return res.status(500).json({ message: "Server error: " + err.message });
    }
});

export { router as studentRouter };
