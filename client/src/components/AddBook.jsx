import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AddBook.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const AddBook = () => {
    const [name, setName] = useState('');
    const [author, setAuthor] = useState('');
    const [price, setPrice] = useState('');
    const [image, setImage] = useState(null);
    const [genre, setGenre] = useState('');
    const [description, setDescription] = useState('');
    const navigate = useNavigate();
    const { userId } = useAuth();

    useEffect(() => {
        if (!userId) {
            alert('Student ID is required. Please log in.');
            navigate('/login');
        }
    }, [userId, navigate]);

    const resetForm = () => {
        setName('');
        setAuthor('');
        setPrice('');
        setImage(null);
        setGenre('');
        setDescription('');
        document.getElementById('image').value = ''; // Reset file input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('Student_id', userId);
        formData.append('name', name);
        formData.append('author', author);
        formData.append('price', price);
        formData.append('genre', genre);
        formData.append('description', description);
        formData.append('image', image);

        console.log({
            Student_id: userId,
            name,
            author,
            price,
            genre,
            description,
            image: image?.name
        });

        try {
            const res = await axios.post('http://localhost:3001/book/add', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            });

            if (res.data.Added) {
                alert("Book added successfully!");
                resetForm(); // Clear input fields
                navigate('/books');
            } else {
                console.log(res.data);
            }
        } catch (err) {
            console.error('Error:', err.response.data);
        }
    };

    return (
        <div className='student-form'>
            <div className="student-form-container">
                <form className='form-group' onSubmit={handleSubmit}>
                    <h2>Add Book</h2>
                    <div className="form-group">
                        <label htmlFor='book'>Book Name:</label>
                        <input type='text' id="book" name="book" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor='author'>Book Author:</label>
                        <input type='text' id="author" name="author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor='price'>Price:</label>
                        <input type='number' id="price" name="price" value={price} onChange={(e) => setPrice(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor='genre'>Genre:</label>
                        <input type='text' id="genre" name="genre" value={genre} onChange={(e) => setGenre(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor='description'>Description:</label>
                        <textarea id='description' name='description' value={description} onChange={(e) => setDescription(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor='image'>Upload Image:</label>
                        <input type='file' id="image" name="image" onChange={(e) => setImage(e.target.files[0])} required />
                    </div>
                    <button type='submit'>Add Book</button>
                </form>
            </div>
        </div>
    );
};

export default AddBook;
