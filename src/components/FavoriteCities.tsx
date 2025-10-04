'use client';
import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline } from '@heroicons/react/24/outline';

export default function FavoriteCities({ currentCity, onCitySelect }: { currentCity: string, onCitySelect: (city: string) => void }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('favorite_cities');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        setFavorites([]);
      }
    }
  }, []);

  const toggleFavorite = (city: string) => {
    const updated = favorites.includes(city)
      ? favorites.filter(c => c !== city)
      : [...favorites, city];
    setFavorites(updated);
    localStorage.setItem('favorite_cities', JSON.stringify(updated));
  };

  const isFavorite = favorites.includes(currentCity);

  return (
    <div className="mt-3 animate-fade-in">
      <button
        onClick={() => toggleFavorite(currentCity)}
        className="backdrop-blur-2xl bg-white/18 hover:bg-white/20 border border-white/30 
                   rounded-xl px-3 py-2 flex items-center gap-2 transition-all hover:scale-105 text-sm"
      >
        {isFavorite ? (
          <StarIcon className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarOutline className="w-4 h-4 text-white" />
        )}
        <span className="text-white text-xs font-light">
          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </span>
      </button>

      {favorites.length > 0 && (
        <div className="mt-2">
          <p className="text-white/60 text-xs font-light mb-1.5">Favorites:</p>
          <div className="flex gap-1.5 flex-wrap">
            {favorites.map((city) => (
              <button
                key={city}
                onClick={() => onCitySelect(city)}
                className="backdrop-blur-2xl bg-white/15 hover:bg-white/15 border border-white/30 
                           rounded-full px-2.5 py-1 text-white text-xs transition-all hover:scale-105 font-light"
              >
                {city}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
