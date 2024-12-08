import React, { useState } from 'react';
import axios from 'axios';
import '../css/Login.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const Login = ({ setRoleProp }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState(null); // Add error state
  const navigate = useNavigate();
  const { setUserId } = useAuth();

  axios.defaults.withCredentials = true;

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(null); // Clear any previous error

    axios.post('http://localhost:3001/auth/login', { username, password, role })
      .then(res => {
        if (res.data.login) {
          setRoleProp(role); // Set the role based on the response
          setUserId(res.data.id); // Set userId in AuthContext
          localStorage.setItem('userId',res.data.id);
          if (role === 'admin') {
            navigate('/dashboard');
          } else {
            navigate(`/books`);
          }
        } else {
          setError('Login failed. Please check your credentials.'); // Set error message
        }
      })
      .catch(err => {
        console.error(err);
        setError('An error occurred while logging in. Please try again.'); // Set error message
      });
  };

  return (
    <div className='login-page'>
      <div className="login-container">
        <h2>Login</h2>
        {error && <div style={{ color: 'red' }}>{error}</div>} {/* Display error message */}
        <form onSubmit={handleSubmit}> {/* Add form to handle submit */}
          <div className="form-group">
            <label htmlFor='username'>Username:</label>
            <input 
              type='text' 
              placeholder='Enter Username' 
              onChange={(e) => setUsername(e.target.value)} 
              required // Add required attribute
            />
          </div>
          <div className="form-group">
            <label htmlFor='password'>Password:</label>
            <input 
              type='password' 
              placeholder='Enter Password' 
              onChange={(e) => setPassword(e.target.value)} 
              required // Add required attribute
            />
          </div>
          <div className="form-group">
            <label htmlFor='role'>Role:</label>
            <select 
              name="role" 
              id="role" 
              onChange={(e) => setRole(e.target.value)} 
              value={role} // Set value to reflect current role
            >
              <option value='admin'>Admin</option>
              <option value='student'>Student</option>
            </select>
          </div>
          <button type='submit' className='btn-login'>Login</button> {/* Change to type='submit' */}
        </form>
      </div>
    </div>
  );
};

export default Login;
