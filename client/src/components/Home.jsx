import React, { useEffect, useState } from 'react';
import '../css/Home.css';
import axios from 'axios';
import { useAuth } from '../AuthContext';

const Home = ({ setRoleProp }) => {
  const { userId } = useAuth();
  axios.defaults.withCredentials = true;

  useEffect(() => {
    axios.get('http://localhost:3001/auth/verify')
      .then(res => {
        if (res.data.login) {
          setRoleProp(res.data.role);
        } else {
          setRoleProp('');
        }
        console.log(res);
      })
      .catch(err => console.log(err));
  }, []);

  return (
    <div className='Home'>
      <div className='Home-content'>
        <h1 className='Home-text'>Book Shop</h1>
        <p className='Home-description'>
        " Discover a world of stories waiting to be explored. Whether you're seeking adventure, romance, or knowledge, our collection has something for every reader."
        </p>
      </div>
      <div className="Home-image"></div>
    </div>
  );
};

export default Home;
