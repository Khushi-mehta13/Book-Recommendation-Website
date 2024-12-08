import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
    Student_id: { type: String, required: true },
    contactme: { type: String},
    genre: [String],  // Array of strings for genres
    name: { type: String, required: true },
    author: { type: String, required: true },
    price: { type: String, required: true },
    imageUrl: { type: String, required: true },  // Store the Cloudinary URL here
    description: { type: String, required: false }  // Add description field; not required
});

const Book = mongoose.model('Book', bookSchema);

export { Book };
