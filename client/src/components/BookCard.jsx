import React from 'react';
import '../css/Book.css';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookCard = ({ book, refreshBooks }) => {
    const { name, author, imageUrl, price, Student_id, _id } = book;
    const navigate = useNavigate();

    // Function to handle book deletion
    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:3001/book/delete/${_id}`);
            alert('Book deleted successfully!');
        } catch (error) {
            console.error('Error deleting book:', error);
            alert('Failed to delete the book!');
        }
    };

    // Function to handle book edit (redirects to edit page)
    const handleEdit = () => {
        navigate(`/book/${_id}`);  // Navigates to the book edit page
    };

    // Get the userId from localStorage, assuming it's already stored there
    const userId = localStorage.getItem('userId');

    return (
        <div className='book-card'>
            <div className='book-details'>
            {userId ? ( // Only render the Link and image if userId exists
                <Link to={`/book-details/${_id}`}>
                    <img src={imageUrl} alt={name} className='book-image' width="20%" />
                </Link>
                ) : (
                <img src={imageUrl} alt={name} className='book-image' width="20%" />
                )}
                <h3>{name}</h3>
                <p>{author}</p>
                <p>₹{price}</p>
                {Student_id === userId && (  // Only allow editing/deleting if the current user is the owner
                    <>
                        <button className='Edit' onClick={handleEdit}>
                            EDIT
                        </button>
                        <button className='delete' onClick={handleDelete}>
                            DELETE
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default BookCard;
