import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import "./db.js";
import { AuthRouter } from "./routes/auth.js";
import { studentRouter } from "./routes/student.js";
import { bookRouter } from "./routes/book.js";
import { Book } from "./models/Book.js";
import { Student } from "./models/Student.js";
import { Admin } from "./models/Admin.js";
import { searchRouter } from "./routes/search.js";

dotenv.config();

const app = express();

// Middleware for JSON parsing
app.use(express.json());

// CORS configuration: Allowing specific origins (like frontend URLs) for requests with credentials
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    // If the request includes credentials and the origin is in the allowed list or if there is no origin (e.g., Postman)
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      // Allow all origins for non-credentialed requests
      callback(null, '*');
    }
  },
  credentials: true,  // Allow cookies, headers, etc.
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify the allowed headers
}));

// Middleware for cookies (important if using session cookies)
app.use(cookieParser());

// Define Routes
app.use('/auth', AuthRouter);
app.use('/students', studentRouter);
app.use('/book', bookRouter);
app.use('/search', searchRouter);

// Dashboard Route: Get counts of students, books, and admins
app.get('/dashboard', async (req, res) => {
  try {
    const studentCount = await Student.countDocuments();
    const adminCount = await Admin.countDocuments();
    const bookCount = await Book.countDocuments();

    return res.json({ ok: true, studentCount, bookCount, adminCount });
  } catch (err) {
    return res.status(500).json({ error: 'Server error while fetching dashboard data', details: err.message });
  }
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  // CORS error handling
  if (err.message && err.message === 'CORS policy: Origin not allowed') {
    return res.status(403).json({ error: 'CORS policy: Origin not allowed' });
  }

  // General error handling
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong on the server!' });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
