import React, { useEffect, useState } from 'react';
import '../css/Dashboard.css';
import axios from 'axios';

const Dashboard = () => {
  const [student, setStudent] = useState(0);
  const [admin, setAdmin] = useState(0);
  const [book, setBook] = useState(0);

  useEffect(() => {
    axios.get('http://localhost:3001/dashboard')
      .then(res => {
        if (res.data.ok) {
  

          setStudent(res.data.studentCount);
          setAdmin(res.data.adminCount);
          setBook(res.data.bookCount);
        }
      })
      .catch(err => {
        console.error('Error fetching dashboard data:', err);
      });
  }, []);

  return (
    <div className="dashboard">
      <div className="dashboard-box">
        <h1>Total Books:</h1><br />
        <h2>{book}</h2>
      </div>
      <div className="dashboard-box">
        <h1>Total Students:</h1><br />
        <h2>{student}</h2>
      </div>
      <div className="dashboard-box">
        <h1>Total Admins:</h1><br />
        <h2>{admin}</h2>
      </div>
    </div>
  );
};

export default Dashboard;
