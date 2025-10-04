'use client';
import { useState } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          disabled={isLoading}
          className="w-full px-4 py-2.5 pl-11 rounded-xl 
                   bg-white/20 backdrop-blur-2xl 
                   border border-white/30 
                   text-white placeholder-white/70 
                   focus:outline-none focus:ring-2 focus:ring-white/40 
                   transition-all duration-300 text-sm font-light
                   disabled:opacity-50 disabled:cursor-not-allowed 
                   shadow-lg text-readable-subtle"
        />
        <MagnifyingGlassIcon 
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80" 
        />
      </div>
    </form>
  );
}
