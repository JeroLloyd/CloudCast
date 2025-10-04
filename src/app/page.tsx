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
import HourlyForecast from '@/components/HourlyForecast';
import RainAlert from '@/components/RainAlert';
import UVHeatIndex from '@/components/UVHeatIndex';
import WeatherRadar from '@/components/WeatherRadar';
import WindMap from '@/components/WindMap';
import OfflineIndicator from '@/components/OfflineIndicator';
import { supabase, saveLastCity, getLastCity } from '@/lib/supabase';
import { getUserId, getBackgroundGradient } from '@/lib/weatherUtils';
import { cacheWeatherData, getCachedWeatherData, isOnline } from '@/lib/offlineCache';

export default function Home() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [uvi, setUvi] = useState(0);
  const [aqi, setAqi] = useState(null);
  const [aqiComponents, setAqiComponents] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('C');
  const [bgGradient, setBgGradient] = useState('from-blue-400 via-indigo-400 to-purple-500');

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

    // Check if offline and load cached data
    if (!isOnline()) {
      const cached = getCachedWeatherData(city);
      if (cached) {
        setWeather(cached.current);
        setForecast(cached.forecast || []);
        setHourly(cached.hourly || []);
        setUvi(cached.uvi || 0);
        setAqi(cached.aqi);
        setAqiComponents(cached.aqiComponents || null);
        setAlerts(cached.alerts || []);
        updateBackground(cached.current);
        setLoading(false);
        setError('Showing cached data (offline mode)');
        return;
      } else {
        setError('No internet connection and no cached data available.');
        setLoading(false);
        return;
      }
    }

    try {
      const response = await fetch(`/api/weather?city=${encodeURIComponent(city)}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      setWeather(result.data.current);
      setForecast(result.data.forecast || []);
      setHourly(result.data.hourly || []);
      setUvi(result.data.uvi || 0);
      setAqi(result.data.aqi);
      setAqiComponents(result.data.aqiComponents || null);
      setAlerts(result.data.alerts || []);
      updateBackground(result.data.current);

      // Cache the data for offline use
      cacheWeatherData(city, result.data);

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
      
      // Try to load cached data on error
      const cached = getCachedWeatherData(city);
      if (cached) {
        setWeather(cached.current);
        setForecast(cached.forecast || []);
        setHourly(cached.hourly || []);
        setUvi(cached.uvi || 0);
        setAqi(cached.aqi);
        setAqiComponents(cached.aqiComponents || null);
        setAlerts(cached.alerts || []);
        updateBackground(cached.current);
        setError('Showing cached data (connection error)');
      }
    } finally {
      setLoading(false);
    }
  }

  async function fetchWeatherByCoords(lat: number, lon: number) {
    setLoading(true);
    setError('');

    // Check if offline
    if (!isOnline()) {
      setError('No internet connection. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      
      setWeather(result.data.current);
      setForecast(result.data.forecast || []);
      setHourly(result.data.hourly || []);
      setUvi(result.data.uvi || 0);
      setAqi(result.data.aqi);
      setAqiComponents(result.data.aqiComponents || null);
      setAlerts(result.data.alerts || []);
      updateBackground(result.data.current);

      // Cache the data
      cacheWeatherData(result.data.current.name, result.data);

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
    <main className={`h-screen bg-gradient-to-br ${bgGradient} transition-all duration-1000 ease-in-out overflow-hidden`}>
      <ThemeToggle />
      <OfflineIndicator />
      
      <div className="h-full flex flex-col px-3 py-2">
        
        {/* Header */}
        <div className="text-center mb-1.5">
          <h1 className="text-xl font-thin text-white tracking-tight">CloudCast</h1>
          <p className="text-white/70 font-light text-xs">Your elegant weather companion</p>
        </div>

        {/* Search Bar */}
        <div className="w-full max-w-xl mx-auto mb-2">
          <SearchBar onSearch={fetchWeather} isLoading={loading} />
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/70 mt-3 font-light text-sm">Getting your location...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !weather && (
          <div className="flex-1 flex items-center justify-center">
            <div className="backdrop-blur-xl bg-red-500/20 rounded-2xl p-4 border border-red-300/30 max-w-md">
              <p className="text-white text-center text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        {!loading && weather && (
          <div className="flex-1 overflow-hidden">
            <div className="h-full grid grid-cols-1 xl:grid-cols-12 gap-3 max-w-[1800px] mx-auto">
              
              {/* LEFT COLUMN */}
              <div className="xl:col-span-5 flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar pr-3">
                {/* Severe Weather Alerts */}
                {alerts && alerts.length > 0 && <WeatherAlerts alerts={alerts} />}
                
                {/* Error/Warning Banner (if using cached data) */}
                {error && weather && (
                  <div className="backdrop-blur-xl bg-yellow-500/20 rounded-2xl p-2 border border-yellow-400/30">
                    <p className="text-yellow-200 text-xs text-center">{error}</p>
                  </div>
                )}
                
                {/* Main Weather Card */}
                <WeatherCard weather={weather} unit={unit} onToggleUnit={() => setUnit(u => u === 'C' ? 'F' : 'C')} />
                
                {/* Favorites */}
                <FavoriteCities currentCity={weather.name} onCitySelect={fetchWeather} />
              </div>

              {/* RIGHT COLUMN */}
              <div className="xl:col-span-7 flex flex-col gap-2 h-full overflow-y-auto custom-scrollbar pr-3">
                {/* Rain Alert */}
                <RainAlert hourly={hourly} />
                
                {/* Hourly Forecast */}
                {hourly && hourly.length > 0 && <HourlyForecast hourly={hourly} unit={unit} />}
                
                {/* Two-Column Grid for Compact Features */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {/* UV & Heat Index */}
                  <UVHeatIndex uvi={uvi} temp={weather.main.temp} humidity={weather.main.humidity} />
                  
                  {/* Air Quality with Pollutants */}
                  {aqi && <AirQuality aqi={aqi} components={aqiComponents} />}
                  
                  {/* Wind Map */}
                  <WindMap 
                    windSpeed={weather.wind.speed} 
                    windDeg={weather.wind.deg} 
                    windGust={weather.wind.gust} 
                  />
                  
                  {/* Sun Times */}
                  <SunTimes sunrise={weather.sys.sunrise} sunset={weather.sys.sunset} />
                </div>
                
                {/* Weather Radar - Full Width */}
                <WeatherRadar 
                  lat={weather.coord.lat} 
                  lon={weather.coord.lon} 
                  cityName={weather.name} 
                />
                
                {/* 5-Day Forecast */}
                {forecast && forecast.length > 0 && <ForecastCard forecast={forecast} unit={unit} />}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
