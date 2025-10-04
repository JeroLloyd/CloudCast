'use client';
import { useState, useEffect } from 'react';
import { MapPinIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface SavedLocation {
  id: string;
  name: string;
  country: string;
  temp: number;
  weather: string;
}

export default function TravelMode({ onSelectCity }: { onSelectCity: (city: string) => void }) {
  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [newCity, setNewCity] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('travel_locations');
    if (saved) {
      try {
        setLocations(JSON.parse(saved));
      } catch (e) {
        setLocations([]);
      }
    }
  }, []);

  const saveLocations = (locs: SavedLocation[]) => {
    setLocations(locs);
    localStorage.setItem('travel_locations', JSON.stringify(locs));
  };

  const addLocation = async () => {
    if (!newCity.trim()) return;
    
    setIsAdding(true);
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(newCity)}`);
      const result = await response.json();
      
      if (result.success) {
        const newLoc: SavedLocation = {
          id: Date.now().toString(),
          name: result.data.current.name,
          country: result.data.current.sys.country,
          temp: Math.round(result.data.current.main.temp - 273.15),
          weather: result.data.current.weather[0].main,
        };
        
        saveLocations([...locations, newLoc]);
        setNewCity('');
      }
    } catch (err) {
      console.error('Failed to add location:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const removeLocation = (id: string) => {
    saveLocations(locations.filter(loc => loc.id !== id));
  };

  const getWeatherIcon = (weather: string) => {
    const icons: Record<string, string> = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Snow: '❄️',
      Thunderstorm: '⛈️',
      Drizzle: '🌦️',
      Mist: '🌫️',
    };
    return icons[weather] || '🌤️';
  };

  return (
    <div className="backdrop-blur-2xl bg-white/18 rounded-2xl p-3 border border-white/30">
      <h3 className="text-white font-light text-sm mb-3 flex items-center gap-2">
        <MapPinIcon className="w-5 h-5" />
        Travel Mode
      </h3>

      {/* Add City Input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={newCity}
          onChange={(e) => setNewCity(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && addLocation()}
          placeholder="Add city..."
          className="flex-1 px-3 py-2 rounded-lg bg-white/18 border border-white/30 text-white placeholder-white/50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400/50"
          disabled={isAdding}
        />
        <button
          onClick={addLocation}
          disabled={isAdding}
          className="p-2 rounded-lg bg-blue-500/30 hover:bg-blue-500/50 text-white transition-all disabled:opacity-50"
        >
          <PlusIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Saved Locations */}
      <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
        {locations.length === 0 ? (
          <p className="text-white/50 text-xs text-center py-4">No saved locations yet</p>
        ) : (
          locations.map((loc) => (
            <div
              key={loc.id}
              className="backdrop-blur-lg bg-white/15 rounded-lg p-3 hover:bg-white/18 transition-all cursor-pointer group"
              onClick={() => onSelectCity(loc.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-3xl">{getWeatherIcon(loc.weather)}</span>
                  <div className="flex-1">
                    <p className="text-white text-sm font-light">{loc.name}</p>
                    <p className="text-white/50 text-xs">{loc.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white text-lg font-light">{loc.temp}°C</p>
                    <p className="text-white/60 text-xs">{loc.weather}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeLocation(loc.id);
                  }}
                  className="ml-2 p-1 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
