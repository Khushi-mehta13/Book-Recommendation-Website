import axios from 'axios';
import React, { useState } from 'react';
import '../css/Book.css';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = async (query) => {
    if (!query) {
      onSearch([]); // Clear results if the search term is empty
      return;
    }

    try {
      const response = await axios.get('http://localhost:3001/search', {
        params: { query }
      });
      onSearch(response.data); // Pass the search results back to the parent
    } catch (err) {
      console.error('Error during search:', err);
      onSearch([]); // Clear results on error
    }
  };

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    handleSearch(value); // Trigger search on input change
  };

  return (
    <div className="search-bar">
      <input
        type="text"
        value={searchTerm}
        onChange={handleChange}
        placeholder="Search books..."
      />
    </div>
  );
};

export default SearchBar;
