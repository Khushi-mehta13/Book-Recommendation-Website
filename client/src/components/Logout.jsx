import React, { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Logout = ({ setRoleProp }) => {
  const navigate = useNavigate(); // Use useNavigate as a function
  useEffect(() => {
    axios.get('http://localhost:3001/auth/logout')
      .then(res => {
        if (res.data.logout) {
          setRoleProp('');
          navigate('/');
        }
      })
      .catch(err => console.log(err));
  }, [navigate, setRoleProp]); // Include navigate and setRoleProp in the dependency array

  // You need to return something from your component
  return null;
}

export default Logout;
