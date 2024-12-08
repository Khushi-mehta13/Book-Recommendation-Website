import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    roll: { type: String },
    username: { type: String, required: true, unique: true }, // Unique username
    password: { type: String, required: true },
    grade: { type: String },
    contact: { type: String, required: true },
    salt: { type: String, required: true }, // Salt field for password hashing
    email: { type: String, required: true, unique: true } // Unique and required email field
});

const studentModel = mongoose.model('Student', studentSchema);

export { studentModel as Student };
