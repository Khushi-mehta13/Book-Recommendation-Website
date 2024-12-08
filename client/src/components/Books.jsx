import React, { useEffect, useState } from 'react';
import axios from 'axios';
import BookCard from './BookCard';
import SearchBar from './SearchBar';
import RecommendedBooks from './RecommendedBooks';
import { useAuth } from '../AuthContext';

const Books = () => {
  const [books, setBooks] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchHistoryLength, setSearchHistoryLength] = useState(0);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const { userId } = useAuth();

  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:3001/book/books');
      setBooks(response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const fetchSearchHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/search/searchHistory/${userId}`);
      setSearchHistoryLength(response.data.searchHistoryLength);
      console.log('Search History Length:', response.data.searchHistoryLength);
    } catch (error) {
      console.error('Error fetching search history:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
    if (userId) {
      fetchSearchHistory();
    }
  }, [userId]);

  const handleSearch = (results) => {
    setSearchResults(results);
  };

  useEffect(() => {
    if (searchResults.length > 0) {
      const timer = setTimeout(() => {
        setShowRecommendations(true);
      }, 1000);

      return () => clearTimeout(timer);
    } else {
      setShowRecommendations(false);
    }
  }, [searchResults]);

  const displayedBooks = searchResults.length > 0 ? searchResults : books;
    const onRefresh = () => {
    setBooks(allBooks); // Reset books to the full list
    setSearchTerm(""); // Clear the search term
  };

  return (
    <>
      <SearchBar id="search" onSearch={handleSearch} clearInput={false} />

      {searchResults.length === 0 && searchHistoryLength > 0 && (
        <RecommendedBooks userId={userId} searchTerm={searchHistoryLength} />
      )}

      {showRecommendations && searchResults.length > 0 && (
        <RecommendedBooks userId={userId} searchTerm={searchResults.join(' ')} />
      )}

      <h1 id='bookhead'>Books</h1>
      <div className="book-list">
        {displayedBooks.length > 0 ? (
          displayedBooks.map((book) => <BookCard key={book._id} book={book} userId={userId} />)
        ) : (
          <p>No books available</p>
        )}
      </div>
    </>
  );
};

export default Books;
