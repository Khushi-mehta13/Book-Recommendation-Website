import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const BookContext = createContext();

export const BookProvider = ({ children }) => {
  const [books, setBooks] = useState([]); // All books
  const [searchResults, setSearchResults] = useState([]); // Search results
  const [recommendedBooks, setRecommendedBooks] = useState([]); // Recommended books

  // Fetch all books from the API
  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:3001/book/books');
      setBooks(response.data);
      setSearchResults([]); // Clear search results
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  // Fetch recommended books for a user
  const fetchRecommendedBooks = async (userId) => {
    try {
      const response = await axios.get(`http://localhost:3001/book/recommendations/${userId}`);
      setRecommendedBooks(response.data);
    } catch (error) {
      console.error('Error fetching recommended books:', error);
    }
  };

  // Handle search functionality
  const handleSearch = (results) => {
    setSearchResults(results);
  };

  useEffect(() => {
    fetchBooks(); // Fetch books on component mount
  }, []);

  return (
    <BookContext.Provider
      value={{
        books,
        searchResults,
        recommendedBooks,
        fetchBooks,
        fetchRecommendedBooks,
        handleSearch,
      }}
    >
      {children}
    </BookContext.Provider>
  );
};
