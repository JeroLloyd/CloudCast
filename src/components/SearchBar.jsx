import { useState, useEffect, useRef } from 'react';
import Fuse from 'fuse.js';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const fuseOptions = {
  keys: ['name', 'country', 'subcountry'],
  threshold: 0.3,
  minMatchCharLength: 2,
};

export default function SearchBar({ onSearch, isLoading }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [fuse, setFuse] = useState(null);
  const wrapperRef = useRef(null);
  const debounceTimer = useRef(null);

  // Load cities.json on mount
  useEffect(() => {
    fetch('/cities.json')
      .then((r) => r.json())
      .then((data) => setFuse(new Fuse(data, fuseOptions)));
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fuzzy search with Fuse.js (if loaded)
  const fetchCitySuggestions = (searchQuery) => {
    if (searchQuery.length < 2 || !fuse) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    const results = fuse.search(searchQuery, { limit: 10 });
    setSuggestions(results.map(res => res.item));
    setShowSuggestions(results.length > 0);
    setIsSearching(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      fetchCitySuggestions(value);
    }, 200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (city) => {
    const cityLabel = `${city.name}${city.subcountry ? ', ' + city.subcountry : ''}, ${city.country}`;
    setQuery(cityLabel);
    onSearch(cityLabel);
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const clearInput = () => {
    setQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  // Highlight matches
  const highlightMatch = (text, input) => {
    if (!input) return text;
    const regex = new RegExp(input.replace(/\s+/g, ' ').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    const parts = text.split(regex);
    const matches = text.match(regex);
    let merged = [];
    for (let i = 0; i < parts.length; i++) {
      merged.push(<span key={i + '_n'}>{parts[i]}</span>);
      if (matches && matches[i]) merged.push(
        <span key={i + '_m'} className="font-bold text-white">{matches[i]}</span>
      );
    }
    return merged;
  };

  return (
    <div ref={wrapperRef} className="w-full relative">
      <form onSubmit={handleSubmit} className="w-full">
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={handleInputChange}
            placeholder="Search city..."
            disabled={isLoading}
            className="w-full px-4 py-2.5 pl-11 pr-10 rounded-xl 
                      bg-white/20 backdrop-blur-2xl 
                      border border-white/30 
                      text-white placeholder-white/70 
                      focus:outline-none focus:ring-2 focus:ring-white/40 
                      transition-all duration-300 text-sm font-light
                      disabled:opacity-50 disabled:cursor-not-allowed 
                      shadow-lg text-readable-subtle"
            autoComplete="off"
          />
          <MagnifyingGlassIcon 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/80" 
          />
          {query && !isSearching && (
            <button
              type="button"
              onClick={clearInput}
              className="absolute right-3 top-1/2 -translate-y-1/2 
                        text-white/80 hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 
                      bg-white/20 backdrop-blur-2xl 
                      border border-white/30 
                      rounded-xl shadow-lg 
                      overflow-hidden z-50
                      max-h-64 overflow-y-auto">
          {suggestions.map((city, index) => (
            <button
              key={`${city.name}-${city.country}-${index}`}
              onClick={() => handleSuggestionClick(city)}
              className="w-full px-4 py-3 text-left 
                        text-white hover:bg-white/10 
                        transition-colors duration-200
                        border-b border-white/10 last:border-b-0
                        flex justify-between items-center group"
            >
              <span className="font-medium">
                {highlightMatch(city.name, query)}
                {city.subcountry && (
                  <span className="text-white/70">, {city.subcountry}</span>
                )}
              </span>
              <span className="text-sm text-white/70 group-hover:text-white/90">
                {city.country}
              </span>
            </button>
          ))}
        </div>
      )}
      {isSearching && query.length >= 2 && (
        <div className="absolute top-full left-0 right-0 mt-2 
                      bg-white/20 backdrop-blur-2xl 
                      border border-white/30 
                      rounded-xl shadow-lg 
                      px-4 py-3 text-white/70 text-sm">
          Searching cities...
        </div>
      )}
    </div>
  );
}
