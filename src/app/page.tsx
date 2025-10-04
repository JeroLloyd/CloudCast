'use client';
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import WeatherCard from '@/components/WeatherCard';
import { supabase, saveLastCity, getLastCity } from '@/lib/supabase';
import { getUserId, getBackgroundGradient } from '@/lib/weatherUtils';

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('C');
  const [bgGradient, setBgGradient] = useState('from-blue-400 via-indigo-400 to-purple-500');

  useEffect(() => {
    loadLastCity();
  }, []);

  useEffect(() => {
    if (!weather) requestGeolocation();
  }, [weather]);

  async function loadLastCity() {
    try {
      const userId = getUserId();
      if (!userId) return;
      const lastCity = await getLastCity(userId);
      if (lastCity?.last_city) fetchWeather(lastCity.last_city);
    } catch (err) {
      // handle error silently
    }
  }

  function requestGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchWeatherByCoords(
            position.coords.latitude,
            position.coords.longitude
          );
        }
      );
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
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-thin text-white mb-2 tracking-tight">
            CloudCast
          </h1>
          <p className="text-white/70 font-light">
            Your elegant weather companion
          </p>
        </header>

        <SearchBar onSearch={fetchWeather} isLoading={loading} />

        {loading && (
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="max-w-2xl mx-auto backdrop-blur-xl bg-red-500/20 rounded-2xl p-6 border border-red-300/30">
            <p className="text-white text-center">{error}</p>
          </div>
        )}

        {!loading && weather && (
          <WeatherCard
            weather={weather}
            unit={unit}
            onToggleUnit={() => setUnit(u => u === 'C' ? 'F' : 'C')}
          />
        )}
      </div>
    </main>
  );
}
