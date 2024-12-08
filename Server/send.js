import express from "express";
import crypto from "crypto"; // Import crypto for hashing
import { Admin } from "./models/Admin.js";
import './db.js';

// Function to hash password with a generated salt
async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex'); // Generate a random salt
    const iterations = 100000; // High iterations for security
    const keyLength = 64; // Length of the derived key

    // Use PBKDF2 to hash the password
    const hash = await new Promise((resolve, reject) => {
        crypto.pbkdf2(password, salt, iterations, keyLength, 'sha256', (err, derivedKey) => {
            if (err) reject(err);
            resolve(derivedKey.toString('hex'));
        });
    });

    return { salt, hash }; // Return both salt and hash
}

// Function to create an Admin account if it doesn't exist
async function AdminAccount() {
    try {
        const adminCount = await Admin.countDocuments(); // Check how many admin accounts exist
        console.log(adminCount);
        
        if (adminCount === 0) {
            const { salt, hash: hashedPassword } = await hashPassword('123'); // Hash the password

            // Create a new Admin object
            const newAdmin = new Admin({
                username: 'admin',
                password: hashedPassword, // Save the hashed password
                salt // Save the salt for later verification
            });

            await newAdmin.save(); // Save the new admin to the database
            console.log("Account Created");
        } else {
            console.log("Account Already exists");
        }
    } catch (err) {
        console.error("Error: ", err); // Log any errors
    }
}

// Call the function to create the admin account
AdminAccount();
