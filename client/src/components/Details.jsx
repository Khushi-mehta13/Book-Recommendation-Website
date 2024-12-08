import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import '../css/Details.css';

export default function BookDetails() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [book, setBook] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRequestSent, setIsRequestSent] = useState(false);
    const [approvalStatus, setApprovalStatus] = useState('pending');
    const [ownerContact, setOwnerContact] = useState('');

    useEffect(() => {
        const fetchBookDetails = async () => {
            try {
                const response = await axios.get(`http://localhost:3001/book/book/${id}`);
                setBook(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching book:', err);
                setError('Failed to fetch book details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchBookDetails();
    }, [id]);

    useEffect(() => {
        if (isRequestSent) {
            const interval = setInterval(async () => {
                try {
                    const userId = localStorage.getItem('userId');
                    if (!userId) return;

                    const response = await axios.get(`http://localhost:3001/book/request-status`, {
                        params: { bookId: id, buyerId: userId },
                    });

                    const { status, contact } = response.data;
                    setApprovalStatus(status);

                    if (status === 'approved') {
                        setOwnerContact(contact);
                        clearInterval(interval);
                    } else if (status === 'rejected') {
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error('Error checking approval status:', err);
                }
            }, 5000);

            return () => clearInterval(interval);
        }
    }, [isRequestSent, id]);

    const handleContactRequest = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) {
            alert('You need to log in to request contact information.');
            navigate('/login');
            return;
        }

        try {
            const response = await axios.post('http://localhost:3001/book/contact-request', {
                bookId: id,
                buyerId: userId,
            });

            if (response.data.message) {
                setIsRequestSent(true);
                alert(response.data.message);
            }
        } catch (err) {
            console.error('Error sending contact request:', err);
            alert('Failed to send contact request. Please try again later.');
        }
    };

    return (
        <div className="book-detail">
            <h2>Book Details</h2>
            {isLoading ? (
                <div className="loader">Loading...</div>
            ) : error ? (
                <p className="error-message">{error}</p>
            ) : book ? (
                <div className="book-detail-container">
                    <img src={book.imageUrl} alt={book.name || "Book cover"} />
                    <p id="title"><strong>Title:</strong> {book.name}</p>
                    <p id="author"><strong>Author:</strong> {book.author}</p>
                    <p id="price"><strong>Price:</strong> ₹{book.price}</p>

                    {approvalStatus === 'approved' ? (
                        <p id="contact"><strong>Contact:</strong> {ownerContact}</p>
                    ) : isRequestSent ? (
                        approvalStatus === 'pending' ? (
                            <p>Your request is sended to the owner</p>
                        ) : (
                            <p>Your contact request has been rejected.</p>
                        )
                    ) : (
                        <button
                            className="contact-request-button"
                            onClick={handleContactRequest}
                            aria-label="Request contact information for the book owner"
                        >
                            Request Contact Information
                        </button>
                    )}
                </div>
            ) : (
                <p>Book details not found.</p>
            )}
        </div>
    );
}
