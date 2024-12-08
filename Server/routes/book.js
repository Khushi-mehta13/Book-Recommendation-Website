import express from 'express';
import { Book } from '../models/Book.js';
import { ContactRequest } from '../models/contactRequest.js';
import { Student } from '../models/Student.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../Cloudnairy/cloudinaryConfig.js';
import multer from 'multer';
import { SearchHistory } from '../models/searchHistory.js';  // Adjust the path as needed
import path from 'path';
import { exec } from 'child_process';
import { verifyToken } from './auth.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const router = express.Router();

// Configure CloudinaryStorage for Multer
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'books',
    format: async (req, file) => {
      const allowedFormats = ['jpg', 'png', 'jpeg'];
      const fileFormat = path.extname(file.originalname).toLowerCase().slice(1);
      if (!allowedFormats.includes(fileFormat)) {
        throw new Error('Invalid file format');
      }
      return fileFormat;
    },
    public_id: (req, file) => path.parse(file.originalname).name,
  },
});

const upload = multer({ storage });

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Add a new book
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Image file is required.' });

    const bookData = {
      Student_id: req.body.Student_id,
      name: req.body.name,
      author: req.body.author,
      price: req.body.price,
      contact: req.body.contact,
      email: req.body.email,
      genre: req.body.genre,
      imageUrl: req.file.path,
      description: req.body.description,
    };

    const newBook = new Book(bookData);
    await newBook.save();

    return res.status(201).json({ added: true, book: newBook });
  } catch (error) {
    console.error('Error adding book:', error);
    return res.status(500).json({ message: error.message });
  }
});

// Fetch all books
router.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    return res.status(200).json(books);
  } catch (err) {
    console.error('Error fetching books:', err);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// Get book details with conditional contact information
router.get('/book/:id', verifyToken('student'), async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.id;

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: 'Book not found.' });

    const contactRequest = await ContactRequest.findOne({ bookId: id, buyerId, status: 'approved' });

    const response = {
      name: book.name,
      author: book.author,
      price: book.price,
      imageUrl: book.imageUrl,
      contact: contactRequest ? book.contact : undefined,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching book details:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// Update a book
router.put('/book/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedBook) return res.status(404).json({ message: 'Book not found.' });

    return res.status(200).json({ updated: true, book: updatedBook });
  } catch (error) {
    console.error('Error updating book:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
});

// Delete a book
// Ensure correct import

router.delete('/delete/:id', async (req, res) => {
  // Validate if the ID is a valid MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ message: 'Invalid ID format.' });
  }

  console.log('Received ID for deletion:', req.params.id); // Log the received ID for debugging

  try {
    // Attempt to delete the book by its ID
    const deletedBook = await Book.findByIdAndDelete(req.params.id);
    
    // If no book is found with the given ID, return 404
    if (!deletedBook) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    // Delete the book from searchHistory of all users who have searched it
    await SearchHistory.updateMany(
      { 'searches.query': deletedBook.name },  // Look for the book name in searches.query
      { $pull: { searches: { query: deletedBook.name } } }  // Remove the book from searches
    );

    // If deletion is successful, send a success response
    return res.status(200).json({ deleted: true });
  } catch (error) {
    // Log the error for debugging and send an internal server error response
    console.error('Error deleting book:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
});



// Handle recommendations via Python script
router.get('/recommendations/:userId', async (req, res) => {
  const userId = req.params.userId;

  if (!userId) return res.status(400).json({ message: 'User ID is required.' });

  const scriptPath = path.resolve('Python/temp.py');
  const command = `python "${scriptPath}" ${encodeURIComponent(userId)}`;

  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Error executing Python script:', error);
      return res.status(500).json({ message: 'Internal Server Error.' });
    }

    if (stderr) {
      console.error('Python script stderr:', stderr);
      return res.status(500).json({ message: `Python script error: ${stderr}` });
    }

    try {
      const result = JSON.parse(stdout.trim());
      console.log(result)
      return res.status(200).json(result);
    } catch (error) {
      console.error('Error parsing Python script output:', error);
      return res.status(500).json({ message: 'Error parsing script output.' });
    }
  });
});

router.post('/contact-request', async (req, res) => {
  try {
    const { bookId, buyerId } = req.body;

    if (!bookId || !buyerId)
      return res.status(400).json({ message: 'Book ID and Buyer ID are required.' });

    // Find the book
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found.' });

    // Find the owner (student)
    const student = await Student.findById(book.Student_id);
    if (!student) return res.status(404).json({ message: 'Student (book owner) not found.' });

    // Find the buyer
    const buyer = await Student.findById(buyerId);
    if (!buyer) return res.status(404).json({ message: 'Buyer not found.' });

    // Create the contact request
    const contactRequest = new ContactRequest({
      bookId,
      buyerId,
      ownerId: book.Student_id,
      status: 'pending',
    });

    await contactRequest.save();

    // Generate approval and rejection links
    const approvalLink = `http://localhost:3001/book/approve-contact/${contactRequest._id}/approve`;
    const rejectLink = `http://localhost:3001/book/approve-contact/${contactRequest._id}/reject`;

    // Send email to the owner with buyer's name
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: student.email, // Owner's email from `Student` collection
      subject: 'Contact Request Approval',
      html: `
        <p>You have a new contact request for your book: <strong>${book.name}</strong>.</p>
        <p>Rental's Name: <strong>${buyer.username}</strong></p>
        <p>Rental's Contact: <strong>${buyer.contact}</strong></p>
        <p>Click to <a href="${approvalLink}">Approve</a> or <a href="${rejectLink}">Reject</a> the request.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: 'Contact request created and email sent to the owner.' });
  } catch (error) {
    console.error('Error creating contact request:', error);
    return res.status(500).json({ message: 'Internal Server Error.' });
  }
});



// Approve or reject contact request via GET
router.get('/approve-contact/:requestId/:action', async (req, res) => {
  try {
    const { requestId, action } = req.params;

    const contactRequest = await ContactRequest.findById(requestId);
    if (!contactRequest) return res.status(404).send('Contact request not found.');

    const owner = await Student.findById(contactRequest.ownerId);
    const book = await Book.findById(contactRequest.bookId);

    if (!owner) return res.status(404).send('Owner not found.');
    if (!book) return res.status(404).send('Book not found.');

    if (action === 'approve') {
      contactRequest.status = 'approved';
      await contactRequest.save();

      const buyer = await Student.findById(contactRequest.buyerId);
      if (!buyer) return res.status(404).send('Rental not found.');

      // Send email to the buyer
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: buyer.email,
        subject: 'Contact Details Approved',
        html: `<p>Your contact request for the book <strong>${book.name}</strong> has been approved.</p>
               <p>Owner's Contact Number: <strong>${owner.contact}</strong></p>
               <p>Owner's Contact Name: <strong>${owner.username}</strong></p>`,
      };

      await transporter.sendMail(mailOptions);

      return res.send('Contact request approved. Owner contact information sent to the buyer.');
    } else if (action === 'reject') {
      contactRequest.status = 'rejected';
      await contactRequest.save();

      return res.send('Contact request rejected.');
    } else {
      return res.status(400).send('Invalid action.');
    }
  } catch (error) {
    console.error('Error updating contact request:', error);
    return res.status(500).send('Internal Server Error.');
  }
});

export { router as bookRouter };
