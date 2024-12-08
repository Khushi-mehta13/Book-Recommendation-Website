import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Login.css';
import '../css/Edit.css'
import { useNavigate, useParams } from 'react-router-dom';

const EditBook = () => {
    const [name, setName] = useState('');
    const [author, setAuthor] = useState('');
    const [price, setPrice] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        axios.get(`http://localhost:3001/book/book/${id}`)
            .then(res => {
                const { name, author, price, imageUrl } = res.data;
                setName(name);
                setAuthor(author);
                setPrice(price);
                setImageUrl(imageUrl);
            })
            .catch(err => console.log(err));
    }, [id]);

    const handleSubmit = (e) => {
        e.preventDefault(); // Prevent form submission

        if (!name || !author || !price ||  !imageUrl) {
            setError('All fields are required');
            return;
        }

        axios.put(`http://localhost:3001/book/book/${id}`, { name, author, price, imageUrl })
            .then(res => {
                if (res.data.updated) {
                    navigate('/books');
                } else {
                    setError('Failed to update book');
                    console.log(res);
                }
            })
            .catch(err => {
                setError('An error occurred while updating the book');
                console.log(err);
            });
    };
    
    return (
        <div className='student-form' id="Edit">
            <div className="student-form-container">
                <form className='form-group' onSubmit={handleSubmit}>
                    <h2>Edit Book</h2>
                    {error && <div className="error">{error}</div>}
                    <div className="form-group">
                        <label htmlFor='book'>Book Name:</label>
                        <input type='text' id="book" name="book" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor='author'>Book Author:</label>
                        <input type='text' id="author" name="author" value={author} onChange={(e) => setAuthor(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor='price'>Price:</label>
                        <input type='text' id="price" name="price" value={price} onChange={(e) => setPrice(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor='image'>Image URL:</label>
                        <input type='text' id="image" name="image" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
                    </div>
                    <button type='submit'>Edit Book</button>
                </form>
            </div>
        </div>
    );
};

export default EditBook;
