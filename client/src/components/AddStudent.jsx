import React, { useState } from 'react';
import axios from 'axios';
import '../css/Addstudent.css';
import { useNavigate } from 'react-router-dom';

export default function AddStudent() {
    const [Roll, setRoll] = useState('');
    const [username, setUsername] = useState(''); 
    const [password, setPassword] = useState('');
    const [grade, setGrade] = useState('');
    const [contact, setContact] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(null); // Clear previous errors

        // Basic validation
        if (!Roll || !username || !password || !grade || !contact || !email) {
            setError('Please fill in all fields');
            return;
        }
        if (isNaN(contact)) {
            setError('Contact number must be a number');
            return;
        }
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Invalid email format');
            return;
        }
        // Password validation (at least 8 characters, one special character)
        const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
        if (!passwordRegex.test(password)) {
            setError('Password must be at least 8 characters long and include at least one special character');
            return;
        }

        // Get JWT token from localStorage or state (assuming it's stored there after admin login)
        const token = localStorage.getItem('adminToken');

        axios.post(
            'http://localhost:3001/students/register',
            { roll: Roll, username, grade, password, contact, email },
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Include JWT token for authorization
                },
            }
        )
        .then((res) => {
            if (res.data.registered) {
                navigate(`/dashboard`);
            } else {
                setError(res.data.message || 'Registration failed'); // Display backend error message
            }
        })
        .catch((err) => {
            setError('An error occurred: ' + (err.response?.data?.message || err.message)); // Handle error responses
            console.error(err);
        });
    };

    return (
        <div className='student'>
            <div className="student-container">
                <form className='form-group' onSubmit={handleSubmit}>
                    <h2>Add Student</h2>
                    {error && <div style={{ color: 'red' }}>{error}</div>}
                    <div className="form-group">
                        <label htmlFor='roll'>Roll No:</label>
                        <input type='text' id="roll" name="roll" onChange={(e) => setRoll(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor='username'>User Name:</label>
                        <input type='text' id="username" name="username" onChange={(e) => setUsername(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor='grade'>Class:</label>
                        <input type='text' id="grade" name="grade" onChange={(e) => setGrade(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor='password'>Password:</label>
                        <input
                            type='password'
                            id="password"
                            name="password"
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor='contact'>Contact Number:</label>
                        <input
                            type='number'
                            id="contact"
                            name="contact"
                            onChange={(e) => setContact(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor='email'>Email ID:</label>
                        <input type='email' id="email" name="email" onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <button type='submit'>Register</button>
                </form>
            </div>
        </div>
    );
}
