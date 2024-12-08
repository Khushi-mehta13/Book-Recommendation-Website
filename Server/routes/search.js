import express from 'express';
import { Book } from '../models/Book.js';
import { SearchHistory } from '../models/searchHistory.js';
import { verifyUser } from './auth.js'; // Ensure this middleware correctly attaches req.user

const router = express.Router();

// Search books and log search history
router.get('/search', verifyUser, async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.user.id; // Get userId from the verified user (from verifyUser middleware)

        if (!query || query.trim() === '') {
            return res.status(400).json({ message: "Search query is required." });
        }

        // Perform the book search using a case-insensitive regex
        const searchRegex = new RegExp(query, 'i');
        const books = await Book.find({
            $or: [
                { name: { $regex: searchRegex } },
                { author: { $regex: searchRegex } },
                { genre: { $regex: searchRegex } }
            ]
        });

        // Log the search history for the user, only if books are found
        if (books.length > 0) {
            await SearchHistory.findOneAndUpdate(
                { userId }, // Find by userId
                { $push: { searches: { query, date: new Date() } } }, // Add search query with date
                { upsert: true, new: true } // If no record exists, create one
            );
        }
        return res.status(200).json(books);
    } catch (err) {
        console.error("Error during book search:", err); // Log the error
        return res.status(500).json({ message: 'Error searching books: ' + err.message });
    }
});

router.get('/searchHistory/:userId', async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from the route parameters

        // Find the search history for the specified userId
        const history = await SearchHistory.findOne({ userId });

        if (!history || history.searches.length === 0) {
            return res.status(404).json({ message: 'No search history found for this user.' });
        }

        // Return search history length as part of an object
        return res.status(200).json({ searchHistoryLength: history.searches.length });
    } catch (err) {
        console.error("Error retrieving search history:", err); // Log the error
        return res.status(500).json({ message: 'Error retrieving search history: ' + err.message });
    }
});


export { router as searchHistoryRouter };
// Retrieve search history for a user
router.get('/history', verifyUser, async (req, res) => {
    try {
        const userId = req.user.id;

        const history = await SearchHistory.findOne({ userId });

        if (!history || history.searches.length === 0) {
            return res.status(404).json({ message: 'No search history found.' });
        }

        return res.status(200).json(history.searches);
    } catch (err) {
        console.error("Error retrieving search history:", err); // Log the error
        return res.status(500).json({ message: 'Error retrieving search history: ' + err.message });
    }
});

export { router as searchRouter };
