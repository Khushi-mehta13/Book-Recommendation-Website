import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BookCard from './BookCardrecommendation';
import { useAuth } from '../AuthContext';

const RecommendedBooks = () => {
    const [recommendedBooks, setRecommendedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { userId } = useAuth();

    const fetchBookDetails = async (bookId) => {
        try {
            const response = await axios.get(`http://localhost:3001/book/book/${bookId}`);
            console.log('Fetched Book Details for book ID:', bookId, response.data);
            return response.data; // Ensure this includes `_id`
        } catch (error) {
            console.error(`Error fetching details for book ID ${bookId}:`, error);
            return null; // Return null on failure
        }
    };

    const fetchRecommendations = async (userId) => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get(`http://localhost:3001/book/recommendations/${userId}`);
            const bookRecommendations = response.data?.recommendations || [];
            console.log('Book Recommendations:', bookRecommendations);

            if (bookRecommendations.length === 0) {
                setError('No recommendations found.');
                return;
            }

            const fullBookDetails = await Promise.all(
                bookRecommendations.map(async (book) => {
                    const details = await fetchBookDetails(book.id);
                    if (details) {
                        details._id = details._id || book.id; // Ensure `_id` exists
                    }
                    return details;
                })
            );

            setRecommendedBooks(fullBookDetails.filter((book) => book !== null));
        } catch (error) {
            setError('Error fetching recommendations. Please try again later.');
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchRecommendations(userId);
        }
    }, [userId]);

    return (
        <div className='recommended-books'>
            <h2 id="recommend">Recommended Books</h2>
            {loading ? (
                <p id="Loading">Loading...</p>
            ) : error ? (
                <p>{error}</p>
            ) : recommendedBooks.length > 0 ? (
                <div className='book-list'>
                    {recommendedBooks.map((book, index) => {
                        const bookKey = book?._id || book?.id || index; // Fallback for key
                        console.log('Book Key:', bookKey); // Debug the key
                        return <BookCard key={bookKey} book={book} userId={userId} />;
                    })}
                </div>
            ) : (
                <p>No recommended books available</p>
            )}
        </div>
    );
};

export default RecommendedBooks;
