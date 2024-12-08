import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Books from './components/Books';
import Login from './components/login';
import Dashboard from './components/Dashboard';
import AddStudent from './components/AddStudent';
import Logout from './components/Logout';
import { useState } from 'react';
import AddBook from './components/AddBook';
import EditBook from './components/EditBook';
import Delete from './components/Delete';
import { AuthProvider } from './AuthContext.jsx';
import BookDetails from './components/Details.jsx';
import { BookProvider } from './components/BookContext.jsx';

function App() {
  const [role, setRoleProp] = useState('');

  return (
    <BrowserRouter>
      <BookProvider>
      <AuthProvider>
      <Navbar role={role} />
      <Routes>
        <Route path='/' element={<Login setRoleProp={setRoleProp} />} />
        <Route path='/home' element={<Home setRoleProp={setRoleProp} />} /> {/* Removed :id if not necessary */}
        <Route path='/books' element={<Books role={role} />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/addstudent' element={<AddStudent />} />
        <Route path='/logout' element={<Logout setRoleProp={setRoleProp} />} />
        <Route path='/addbook/:id' element={<AddBook />} />
        <Route path='/book/:id' element={<EditBook />} />
        <Route path='/delete/:id' element={<Delete />} />
        <Route path='/book-details/:id' element={<BookDetails/>} />
      </Routes>
      </AuthProvider>

      </BookProvider>
    </BrowserRouter>
  );
}

export default App;
