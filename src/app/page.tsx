'use client';
import { useState, useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
// ... import all other components used in your UI ...
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
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [bgGradient, setBgGradient] = useState('from-blue-600 via-blue-700 to-indigo-800');
  const [pollenData, setPollenData] = useState({ 
    overall: 0, tree: 0, grass: 0, weed: 0, available: false, source: 'unavailable'
  });
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');

  useEffect(() => {
    async function initWeather() {
      // Always try to get current location first
      await checkAndRequestLocation();
    }
    initWeather();
  }, []);

  async function checkAndRequestLocation() {
    // First check if we have a cached position that's very recent (within last minute)
    const cachedPosition = localStorage.getItem('lastKnownPosition');
    const cachedTimestamp = localStorage.getItem('lastKnownPositionTime');
    
    if (cachedPosition && cachedTimestamp) {
      const position = JSON.parse(cachedPosition);
      const timestamp = parseInt(cachedTimestamp);
      
      // Use cached position if it's less than 1 minute old
      if (Date.now() - timestamp < 60000) {
        await fetchWeatherByCoords(position.latitude, position.longitude);
        // Still request new position in background
        requestGeolocation(true);
        return;
      }
    }

    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionState(result.state);
        
        // Listen for permission changes
        result.addEventListener('change', () => {
          setPermissionState(result.state);
          if (result.state === 'granted') requestGeolocation(false);
        });

        if (result.state === 'granted' || result.state === 'prompt') {
          requestGeolocation(false);
        } else if (result.state === 'denied') {
          setError('Location access denied. Please enable location services for more accurate weather data.');
          await fetchWeatherByIP();
        }
      } catch (error) {
        console.error('Permission query failed:', error);
        requestGeolocation(false);
      }
    } else {
      requestGeolocation(false);
    }
  }

  function requestGeolocation() {
    if (!('geolocation' in navigator)) {
      setError('Geolocation not supported by your browser.');
      fetchWeatherByIP();
      return;
    }

    setLoading(true);
    
    // First try high accuracy with a short timeout
    const highAccuracyOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };

    // Fallback options with lower accuracy but more likely to succeed
    const fallbackOptions = {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 0
    };

    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        setPermissionState('granted');
        const { latitude, longitude, accuracy } = position.coords;
        
        // Cache the accurate position
        localStorage.setItem('lastKnownPosition', JSON.stringify({
          latitude,
          longitude,
          accuracy
        }));
        localStorage.setItem('lastKnownPositionTime', Date.now().toString());
        
        // If accuracy is good enough, use this position
        if (accuracy <= 100) { // accuracy in meters
          await fetchWeatherByCoords(latitude, longitude);
          setLoading(false);
          return;
        }

        // If accuracy is not good enough, start watching for better position
        const watchId = navigator.geolocation.watchPosition(
          async (watchPosition) => {
            if (watchPosition.coords.accuracy <= 100) {
              await fetchWeatherByCoords(watchPosition.coords.latitude, watchPosition.coords.longitude);
              navigator.geolocation.clearWatch(watchId);
              setLoading(false);
            }
          },
          null,
          highAccuracyOptions
        );

        // Stop watching after 10 seconds if we haven't got a better position
        setTimeout(() => {
          navigator.geolocation.clearWatch(watchId);
          setLoading(false);
        }, 10000);
      },
      async () => {
        // If high accuracy fails, try with lower accuracy
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            setPermissionState('granted');
            await fetchWeatherByCoords(position.coords.latitude, position.coords.longitude);
            setLoading(false);
          },
          async (error) => {
            handleGeolocationError(error);
            setLoading(false);
          },
          fallbackOptions
        );
      },
      highAccuracyOptions
    );
  }

  async function handleGeolocationError(error) {
    setLoading(false);
    
    // Check if we have a recent cached position we can use
    const cachedPosition = localStorage.getItem('lastKnownPosition');
    const cachedTimestamp = localStorage.getItem('lastKnownPositionTime');
    
    if (cachedPosition && cachedTimestamp) {
      const position = JSON.parse(cachedPosition);
      const timestamp = parseInt(cachedTimestamp);
      
      // Use cached position if it's less than 5 minutes old
      if (Date.now() - timestamp < 300000) {
        console.log('Using cached position due to error:', error);
        await fetchWeatherByCoords(position.latitude, position.longitude);
        return;
      }
    }

    switch (error.code) {
      case error.PERMISSION_DENIED:
        setPermissionState('denied');
        setError('Please enable location access in your browser settings for accurate local weather.');
        await fetchWeatherByIP();
        break;
      case error.POSITION_UNAVAILABLE:
        setError('Unable to detect precise location. Please check your device\'s location settings.');
        await fetchWeatherByIP();
        break;
      case error.TIMEOUT:
        setError('Location detection took too long. Please try again or check your connection.');
        await fetchWeatherByIP();
        break;
      default:
        console.error('Geolocation error:', error);
        setError('Location detection failed. Please ensure location services are enabled.');
        break;
    }
  }

  async function fetchWeatherByIP() {
    if (!isOnline()) {
      setError('No internet connection. Please try again later.');
      return;
    }
    try {
      setLoading(true);
      const response = await fetch('/api/weather');
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
    } catch (err) {
      setError(err.message || 'Failed to detect location');
    } finally {
      setLoading(false);
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
    } catch (err) {
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
    } catch (err) {
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
      <div className="flex-1 flex flex-col px-4 py-4 max-w-[1800px] mx-auto w-full">
        <div className="text-center mb-3">
          <h1 className="text-3xl font-thin text-white tracking-tight text-readable">CloudCast</h1>
          <p className="text-white/90 font-light text-sm text-readable-subtle">Your elegant weather companion</p>
        </div>
        <div className="w-full max-w-3xl mx-auto mb-4">
          <SearchBar onSearch={fetchWeather} isLoading={loading} />
        </div>
        {loading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              <p className="text-white/90 mt-4 font-light text-sm text-readable-subtle">Getting your location...</p>
            </div>
          </div>
        )}
        {error && !weather && (
          <div className="flex-1 flex items-center justify-center">
            <div className="backdrop-blur-3xl bg-red-500/30 rounded-2xl p-6 border border-red-300/50 max-w-md">
              <p className="text-white text-center text-sm text-readable-subtle">{error}</p>
            </div>
          </div>
        )}
        {!loading && weather && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
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
