import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../css/Book.css';

const SearchBar = ({ onSearch, clearInput }) => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (clearInput) {
      setSearchTerm(''); // Clear input when clearInput prop is true
    }
  }, [clearInput]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm) return; // Do not search if input is empty

    try {
      const response = await axios.get('http://localhost:3001/search/search', {
        params: { query: searchTerm },
      });
      console.log('Search Results:', response.data); // Log the results for debugging
      onSearch(response.data); // Pass results back to the parent component
    } catch (err) {
      console.error('Error during search:', err); // Log any errors during the API call
    }
  };

  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search books..."
        />
        <button type="submit" disabled={!searchTerm}>Search</button> {/* Disable button when input is empty */}
      </form>
    </div>
  );
};

export default SearchBar;
