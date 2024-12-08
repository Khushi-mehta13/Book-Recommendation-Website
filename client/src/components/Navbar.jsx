import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import '../css/Navbar.css';

const Navbar = ({ role, onRefresh }) => { // Accept onRefresh prop
  const { userId } = useAuth();
  const location = useLocation();

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to="/books" className="navbar-brand">
          Campus Book
        </Link>
      </div>
      <div className="navbar-right">
        {/* Refresh books when clicking on Books link */}
        <Link to="/books" onClick={onRefresh} className='navbar-link'>Books</Link>

        {role === "admin" && 
         <>
            <Link to="/addstudent" className='navbar-link'>Add Student</Link>
            <Link to="/dashboard" className='navbar-link'>Dashboard</Link>
          </>
        }
        {role === "student" && 
         <>
            <Link to={`/addbook/${userId}`} className='navbar-link'>Add Book</Link>
          </>
        }
        {role === "" ? (
          <Link to="/" className='navbar-link'>Login</Link>
        ) : (
          <Link to="/logout" className='navbar-link'>Logout</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
