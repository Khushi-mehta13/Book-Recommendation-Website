import React, { useEffect, useState } from 'react';
import axios from 'axios';

const SearchHistory = ({ userToken }) => {
  const [searchHistory, setSearchHistory] = useState([]);

  // Fetch the search history
  const fetchSearchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:3001/search/history', {
        headers: { Authorization: `Bearer ${userToken}` } // Assuming userToken is passed as a prop
      });
      setSearchHistory(response.data);
    } catch (err) {
      console.error('Error fetching search history:', err);
    }
  };

  // Handle search based on history item click
  const handleSearchFromHistory = (term) => {
    console.log('Search for:', term);
    // Add logic here to trigger a search based on history term
  };

  // Fetch search history on component mount
  useEffect(() => {
    if (userToken) {
      fetchSearchHistory();
    }
  }, [userToken]);

  return (
    <div className="search-history">
      <h4>Search History</h4>
      {searchHistory.length > 0 ? (
        <ul>
          {searchHistory.map((term, index) => (
            <li key={index} onClick={() => handleSearchFromHistory(term)}>
              {term}
            </li>
          ))}
        </ul>
      ) : (
        <p>No search history available</p>
      )}
    </div>
  );
};

export default SearchHistory;
