'use client';
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import WeatherCard from '@/components/WeatherCard';
import ThemeToggle from '@/components/ThemeToggle';
import ForecastCard from '@/components/ForecastCard';
import AirQuality from '@/components/AirQuality';
import SunTimes from '@/components/SunTimes';
import WeatherAlerts from '@/components/WeatherAlerts';
import HourlyForecast from '@/components/HourlyForecast';
import RainAlert from '@/components/RainAlert';
import UVHeatIndex from '@/components/UVHeatIndex';
import WeatherRadar from '@/components/WeatherRadar';
import WindMap from '@/components/WindMap';
import OfflineIndicator from '@/components/OfflineIndicator';
import PollenIndex from '@/components/PollenIndex';
import TravelMode from '@/components/TravelMode';
import VoiceWeather from '@/components/VoiceWeather';
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
  const [bgGradient, setBgGradient] = useState('from-blue-600 via-blue-700 to-indigo-800');
  const [pollenData, setPollenData] = useState({ 
    overall: 0, 
    tree: 0, 
    grass: 0, 
    weed: 0,
    available: false,
    source: 'unavailable'
  });


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
        setPollenData(cached.pollen || pollenData);
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
      setPollenData(result.data.pollen || pollenData);
      updateBackground(result.data.current);


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
      
      const cached = getCachedWeatherData(city);
      if (cached) {
        setWeather(cached.current);
        setForecast(cached.forecast || []);
        setHourly(cached.hourly || []);
        setUvi(cached.uvi || 0);
        setAqi(cached.aqi);
        setAqiComponents(cached.aqiComponents || null);
        setAlerts(cached.alerts || []);
        setPollenData(cached.pollen || pollenData);
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
      setPollenData(result.data.pollen || pollenData);
      updateBackground(result.data.current);


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
    <main className={`min-h-screen bg-gradient-to-br ${bgGradient} transition-all duration-1000 ease-in-out flex flex-col`}>
      <ThemeToggle />
      <OfflineIndicator />
      
      {/* OPTIMIZED FULL-HEIGHT CONTAINER */}
      <div className="flex-1 flex flex-col px-4 py-4 max-w-[1800px] mx-auto w-full">
        
        {/* Compact Header */}
        <div className="text-center mb-3">
          <h1 className="text-3xl font-thin text-white tracking-tight text-readable">CloudCast</h1>
          <p className="text-white/90 font-light text-sm text-readable-subtle">Your elegant weather companion</p>
        </div>


        {/* Compact Search Bar */}
        <div className="w-full max-w-3xl mx-auto mb-4">
          <SearchBar onSearch={fetchWeather} isLoading={loading} />
        </div>


        {/* Loading State */}
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/90 mt-4 font-light text-sm text-readable-subtle">Getting your location...</p>
            </div>
          </div>
        )}


        {/* Error State */}
        {error && !weather && (
          <div className="flex-1 flex items-center justify-center">
            <div className="backdrop-blur-3xl bg-red-500/30 rounded-2xl p-6 border border-red-300/50 max-w-md">
              <p className="text-white text-center text-sm text-readable-subtle">{error}</p>
            </div>
          </div>
        )}


        {/* BALANCED 3-COLUMN LAYOUT */}
        {!loading && weather && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
            
            {/* LEFT COLUMN - Main Weather + Travel (30%) */}
            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
              {alerts && alerts.length > 0 && <WeatherAlerts alerts={alerts} />}
              
              {error && weather && (
                <div className="backdrop-blur-3xl bg-yellow-500/30 rounded-xl p-3 border border-yellow-400/50">
                  <p className="text-yellow-100 text-xs text-center text-readable-subtle">{error}</p>
                </div>
              )}
              
              <WeatherCard weather={weather} unit={unit} onToggleUnit={() => setUnit(u => u === 'C' ? 'F' : 'C')} />
              
              <TravelMode onSelectCity={fetchWeather} />
              
              <VoiceWeather weather={weather} unit={unit} />
            </div>


            {/* MIDDLE COLUMN - Hourly + Details (35%) */}
            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
              <RainAlert hourly={hourly} />
              
              {hourly && hourly.length > 0 && <HourlyForecast hourly={hourly} unit={unit} />}
              
              {pollenData.available && <PollenIndex data={pollenData} />}
              
              <div className="grid grid-cols-2 gap-4">
                <UVHeatIndex uvi={uvi} temp={weather.main.temp} humidity={weather.main.humidity} />
                <AirQuality aqi={aqi} components={aqiComponents} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <WindMap windSpeed={weather.wind.speed} windDeg={weather.wind.deg} windGust={weather.wind.gust} />
                <SunTimes sunrise={weather.sys.sunrise} sunset={weather.sys.sunset} />
              </div>
            </div>


            {/* RIGHT COLUMN - Radar + Forecast (35%) */}
            <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar pr-2">
              <WeatherRadar lat={weather.coord.lat} lon={weather.coord.lon} cityName={weather.name} />
              
              {forecast && forecast.length > 0 && <ForecastCard forecast={forecast} unit={unit} />}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
