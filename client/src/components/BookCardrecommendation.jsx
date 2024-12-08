import React from 'react';
import '../css/Book.css';
import { Link } from 'react-router-dom';

const RecommendBookCard = ({ book }) => {
    const { name, author, imageUrl, price, _id } = book;
    console.log(_id);
    return (
        <div className='book-card'>
            <div className='book-details'>
                <Link to={`/book-details/${_id}`}>
                    <img src={imageUrl} alt={name} className='book-image' width="20%" />
                </Link>
                <h3>{name}</h3>
                {author && <p>{author}</p>} {/* Conditionally render author if available */}
                {price && <p>₹{price}</p>}   {/* Conditionally render price if available */}
            </div>
        </div>
    );
};

export default RecommendBookCard;
