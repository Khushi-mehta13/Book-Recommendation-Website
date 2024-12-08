import express from 'express';
import { Admin } from '../models/Admin.js';
import { Student } from '../models/Student.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const router = express.Router();

// Function to hash password using PBKDF2
const hashPassword = async (password, salt) => {
    const iterations = 100000; // Use a high number of iterations for security
    const keyLength = 64; // Length of the derived key
    return new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey.toString('hex'));
        });
    });
};

// Route for user login
router.post('/login', async (req, res) => {
    const { username, password, role } = req.body;

    try {
        let user;
        if (role === 'admin') {
            user = await Admin.findOne({ username });
            if (!user) {
                console.log("Admin not found");
                return res.status(404).json({ message: "Admin not registered" });
            }
        } else if (role === 'student') {
            user = await Student.findOne({ username });
            if (!user) {
                console.log("Student not found");
                return res.status(404).json({ message: "Student not registered" });
            }
        } else {
            console.log("Invalid role");
            return res.status(400).json({ message: "Invalid role" });
        }

        // Hash the entered password using the stored salt
        const hashedPassword = await hashPassword(password, user.salt);
        console.log("Entered Password Hash:", hashedPassword);
        console.log("Stored User Password:", user.password);

        if (hashedPassword !== user.password) {
            console.log("Password mismatch");
            return res.status(401).json({ message: "Password is incorrect" });
        }

        // Generate JWT token
        const token = jwt.sign({ username: user.username, role, id: user._id }, process.env[`${role.charAt(0).toUpperCase() + role.slice(1)}_Key`]);
        res.cookie('token', token, { httpOnly: true, secure: true });
        return res.json({ login: true, role, id: user._id });
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message: "Server error" });
    }
});

// Middleware to verify user token
const verifyToken = (role) => (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(403).json({ message: "Invalid token" });
    }

    const secretKey = process.env[`${role.charAt(0).toUpperCase() + role.slice(1)}_Key`];
    jwt.verify(token, secretKey, (err, decoded) => {
        if (err) {
            console.log("JWT verification failed");
            return res.status(403).json({ message: "Invalid token" });
        }
        req.username = decoded.username;
        req.role = decoded.role;
        req.id = decoded.id;
        next();
    });
};

// Middleware to verify user roles
const verifyUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.Student_Key, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = decoded; // Add decoded user info to the request object
        next();
    });
};

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    jwt.verify(token, process.env.Admin_Key, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: "Invalid token" });
        }
        req.user = decoded; // Add decoded user info to the request object
        next();
    });
};

// Route to verify user authentication
router.get('/verify', verifyToken('student'), (req, res) => {
    return res.json({ login: true, role: req.role, id: req.id });
});

// Route to get user details
router.get('/user', verifyUser, (req, res) => {
    return res.json({ user: req.user });
});

// Route to get admin details
router.get('/admin', verifyAdmin, (req, res) => {
    return res.json({ user: req.user });
});

// Route to handle user logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');
    return res.json({ logout: true });
});

// Export router and verification middleware
export { router as AuthRouter, verifyToken, verifyUser, verifyAdmin };
