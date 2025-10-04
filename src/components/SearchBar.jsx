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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto mb-8">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search city..."
          disabled={isLoading}
          className="w-full px-6 py-4 pl-14 rounded-2xl bg-white/20 backdrop-blur-xl 
                   border border-white/30 text-white placeholder-white/60 
                   focus:outline-none focus:ring-2 focus:ring-white/50 
                   transition-all duration-300 text-lg font-light
                   disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <MagnifyingGlassIcon 
          className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-white/60" 
        />
      </div>
    </form>
  );
}