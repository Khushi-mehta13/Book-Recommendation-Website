import express from 'express';
import { Book } from '../models/Book.js';
import { verifyUser } from './auth.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../Cloudnairy/cloudinaryConfig.js';
import path from 'path'; // Import path module here

const router = express.Router();

// Add a new book
import multer from 'multer';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  folder: 'books',
  allowedFormats: ['jpg', 'png', 'jpeg'],
  filename: (req, file) => {
    return file.originalname; // The name of the file to be stored
  },
});

const upload = multer({ storage: storage });

// Route to handle book addition
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const bookData = {
      Student_id: req.body.Student_id,
      name: req.body.name,
      author: req.body.author,
      price: req.body.price,
      contactme: req.body.contactme,
      genre: req.body.genre,
      imageUrl: req.file.path, // Store the Cloudinary URL
      description: req.body.description, 
    };

    const newBook = new Book(bookData);
    await newBook.save();

    return res.json({ Added: true });
  } catch (error) {
    console.error('Error adding book:', error); // Log the error
    return res.status(500).json({ message: 'Something went wrong!' });
  }
});
