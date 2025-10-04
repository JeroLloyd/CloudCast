'use client';
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import WeatherCard from '@/components/WeatherCard';
import ThemeToggle from '@/components/ThemeToggle';
import ForecastCard from '@/components/ForecastCard';
import AirQuality from '@/components/AirQuality';
import SunTimes from '@/components/SunTimes';
import FavoriteCities from '@/components/FavoriteCities';
import WeatherAlerts from '@/components/WeatherAlerts';
import { supabase, saveLastCity, getLastCity } from '@/lib/supabase';
import { getUserId, getBackgroundGradient } from '@/lib/weatherUtils';

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [aqi, setAqi] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('C');
  const [bgGradient, setBgGradient] = useState('from-blue-400 via-indigo-400 to-purple-500');

  // ... (keep all your existing functions)
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
      requestGeolocation();
    }
    initWeather();
  }, []);

  function requestGeolocation() {
    if ('geolocation' in navigator) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
        },
        (err) => {
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
      
      setWeather(result.data.current);
      setForecast(result.data.forecast || []);
      setAqi(result.data.aqi);
      setAlerts(result.data.alerts || []);
      updateBackground(result.data.current);

      const userId = getUserId();
      if (userId) {
        await saveLastCity(userId, {
          name: result.data.current.name,
          country: result.data.current.sys.country,
          lat: result.data.current.coord.lat,
          lon: result.data.current.coord.lon,
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
      
      setWeather(result.data.current);
      setForecast(result.data.forecast || []);
      setAqi(result.data.aqi);
      setAlerts(result.data.alerts || []);
      updateBackground(result.data.current);

      const userId = getUserId();
      if (userId) {
        await saveLastCity(userId, {
          name: result.data.current.name,
          country: result.data.current.sys.country,
          lat: result.data.current.coord.lat,
          lon: result.data.current.coord.lon,
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
    <main className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-all duration-1000 ease-in-out overflow-hidden`}>
      <ThemeToggle />
      
      <div className="h-screen flex flex-col p-4">
        
        {/* Header */}
        <div className="text-center mb-3">
          <h1 className="text-3xl font-thin text-white mb-0.5 tracking-tight">CloudCast</h1>
          <p className="text-white/70 font-light text-xs">Your elegant weather companion</p>
        </div>

        {/* Search Bar - Full Width */}
        <div className="w-full max-w-2xl mx-auto mb-3">
          <SearchBar onSearch={fetchWeather} isLoading={loading} />
        </div>

        {/* Loading/Error States */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/70 mt-3 font-light text-sm">Getting your location...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="backdrop-blur-xl bg-red-500/20 rounded-2xl p-4 border border-red-300/30 max-w-md">
              <p className="text-white text-center text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid - PROPERLY ALIGNED */}
        {!loading && weather && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-hidden max-w-6xl mx-auto w-full">
            
            {/* LEFT COLUMN - Main Weather + Favorites */}
            <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar pr-2">
              {/* Weather Alerts */}
              {alerts && alerts.length > 0 && <WeatherAlerts alerts={alerts} />}
              
              {/* Main Weather Card */}
              <WeatherCard weather={weather} unit={unit} onToggleUnit={() => setUnit(u => u === 'C' ? 'F' : 'C')} />
              
              {/* Favorites */}
              <FavoriteCities currentCity={weather.name} onCitySelect={fetchWeather} />
            </div>

            {/* RIGHT COLUMN - Additional Features */}
            <div className="flex flex-col gap-3 h-full overflow-y-auto custom-scrollbar pr-2">
              {/* 5-Day Forecast */}
              {forecast && forecast.length > 0 && <ForecastCard forecast={forecast} unit={unit} />}
              
              {/* Sun Times */}
              <SunTimes sunrise={weather.sys.sunrise} sunset={weather.sys.sunset} />
              
              {/* Air Quality */}
              {aqi && <AirQuality aqi={aqi} />}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
