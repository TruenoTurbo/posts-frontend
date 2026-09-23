import React, { useState, useEffect } from 'react';
import { SearchFilters } from '../../types';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSearch, initialFilters = {} }) => {
  const [keyword, setKeyword] = useState(initialFilters.keyword || '');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedKeyword(keyword), 300);
    return () => clearTimeout(timer);
  }, [keyword]);

  useEffect(() => {
    if (debouncedKeyword || keyword === '') {
      onSearch({ ...initialFilters, keyword: debouncedKeyword });
    }
  }, [debouncedKeyword]);

  return (
    <div className="relative max-w-2xl mx-auto mb-6">
      <div className="relative">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search posts by title, content, username, location..."
          className="w-full px-4 py-3 pl-12 rounded-xl border border-border bg-bg-card text-text-primary 
                     focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
                     placeholder:text-text-secondary transition-all shadow-card"
          aria-label="Search posts"
        />
        <svg 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {keyword && (
          <button
            onClick={() => setKeyword('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
};
