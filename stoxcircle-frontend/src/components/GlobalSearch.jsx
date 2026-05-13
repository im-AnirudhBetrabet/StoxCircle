import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, CircleNotchIcon } from '@phosphor-icons/react'; // Adjust icons if needed
import { apiFetch } from '../api/client';

export const GlobalSearch = ({ onNavigate }) => {
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 1. Debounce Logic: Update debouncedQuery 300ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer); // Cleanup on unmount or re-type
  }, [query]);

  // 2. Fetch Data when debouncedQuery changes
  useEffect(() => {
    const fetchResults = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        // Calls your /api/v1/search/stocks?q=... endpoint
        const response = await apiFetch(`/search/stocks`, { params: { q: debouncedQuery } });
        // Make sure to access the results array based on your API contract
        setResults(response.results || []);
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    };

    fetchResults();
  }, [debouncedQuery]);

  // 3. Handle Click Outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (symbol) => {
    setIsOpen(false);
    setQuery(''); // Clear search box after selection
    navigate(`/analytics/stocks/${symbol}`);
    if (onNavigate) onNavigate(); // Optional callback to close mobile menus
  };

  return (
    <div className="search-dropdown-wrapper" ref={dropdownRef}>
      
      {/* Input Field */}
      <div style={{ position: 'relative' }}>
        <MagnifyingGlassIcon 
          size={18} 
          style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} 
        />
        <input 
          type="text" 
          placeholder="Search stocks (e.g. RELIANCE)..." 
          className="form-input" 
          style={{ width: '100%', padding: '10px 16px 10px 44px', borderRadius: '100px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--border-subtle)' }} 
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.length >= 2) setIsOpen(true);
          }}
        />
        {/* Loading Spinner */}
        {isSearching && (
          <CircleNotchIcon 
            size={16} 
            className="animate-spin" // Assuming you have a basic rotate keyframe, or just omit if not
            style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--brand-primary)' }} 
          />
        )}
      </div>

      {/* Dropdown Results */}
      {isOpen && query.trim().length >= 2 && (
        <div className="search-dropdown">
          
          {isSearching && results.length === 0 ? (
            <div className="search-empty-state">Searching market data...</div>
          ) : results.length > 0 ? (
            results.map((stock) => (
              <div 
                key={stock.symbol} 
                className="search-dropdown-item"
                onClick={() => handleSelect(stock.symbol)}
              >
                <div className="search-item-header">
                  <span className="search-item-symbol">{stock.symbol.replace('.NS', '')}</span>
                  <span className="badge" style={{ fontSize: '0.65rem' }}>{stock.sector}</span>
                </div>
                <span className="search-item-name">{stock.name}</span>
              </div>
            ))
          ) : (
            <div className="search-empty-state">No stocks found matching "{query}"</div>
          )}

        </div>
      )}
    </div>
  );
};