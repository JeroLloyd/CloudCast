'use client';
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import WeatherCard from '@/components/WeatherCard';
import ThemeToggle from '@/components/ThemeToggle'; // Add this import
import { supabase, saveLastCity, getLastCity } from '@/lib/supabase';
import { getUserId, getBackgroundGradient } from '@/lib/weatherUtils';

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('C');
  const [bgGradient, setBgGradient] = useState('from-blue-400 via-indigo-400 to-purple-500');

  // Load last city or request geolocation on mount
  useEffect(() => {
    async function initWeather() {
      try {
        const userId = getUserId();
        if (userId) {
          const lastCity = await getLastCity(userId);
          if (lastCity?.last_city) {
            await fetchWeather(lastCity.last_city);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading last city:', err);
      }
      
      // If no saved city, request geolocation
      requestGeolocation();
    }

    initWeather();
  }, []);


  

  function requestGeolocation() {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
        },
        (err) => {
          console.log('Geolocation error:', err.message);
          setError('Location access denied. Please search for a city manually.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation not supported. Please search for a city manually.');
    }
  }

  async function fetchWeather(city: string) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      setWeather(result.data);
      updateBackground(result.data);

      const userId = getUserId();
      if (userId) {
        await saveLastCity(userId, {
          name: result.data.name,
          country: result.data.sys.country,
          lat: result.data.coord.lat,
          lon: result.data.coord.lon,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }

  async function fetchWeatherByCoords(lat: number, lon: number) {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      setWeather(result.data);
      updateBackground(result.data);

      const userId = getUserId();
      if (userId) {
        await saveLastCity(userId, {
          name: result.data.name,
          country: result.data.sys.country,
          lat: result.data.coord.lat,
          lon: result.data.coord.lon,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  }

  function updateBackground(weatherData: any) {
    const isDaytime = isDay(weatherData.sys.sunrise, weatherData.sys.sunset);
    const gradient = getBackgroundGradient(weatherData.weather[0].main, isDaytime);
    setBgGradient(gradient);
  }

  function isDay(sunrise: number, sunset: number) {
    const now = Date.now() / 1000;
    return now >= sunrise && now <= sunset;
  }

  return (
    <main className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-all duration-1000 ease-in-out`}>
      {/* Add Theme Toggle Button */}
      <ThemeToggle />
      
      <div className="container mx-auto px-4 py-8 sm:py-12 animate-fade-in">
        <header className="text-center mb-8 sm:mb-12">
          <h1 className="text-4xl sm:text-5xl font-thin text-white mb-2 tracking-tight">
            CloudCast
          </h1>
          <p className="text-white/70 font-light text-sm sm:text-base">
            Your elegant weather companion
          </p>
        </header>

        <SearchBar onSearch={fetchWeather} isLoading={loading} />

        {loading && (
          <div className="text-center animate-pulse">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white/70 mt-4 font-light text-sm sm:text-base">
              Getting your location...
            </p>
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto backdrop-blur-xl bg-red-500/20 rounded-2xl p-4 sm:p-6 border border-red-300/30 animate-fade-in">
            <p className="text-white text-center text-sm sm:text-base">{error}</p>
          </div>
        )}

        {!loading && weather && (
          <div className="animate-fade-in">
            <WeatherCard
              weather={weather}
              unit={unit}
              onToggleUnit={() => setUnit(u => u === 'C' ? 'F' : 'C')}
            />
          </div>
        )}
      </div>
    </main>
  );
}
