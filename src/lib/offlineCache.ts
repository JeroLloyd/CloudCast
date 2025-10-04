// Cache weather data to localStorage
export const cacheWeatherData = (city: string, data: any) => {
  try {
    const cacheData = {
      city,
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`weather_cache_${city}`, JSON.stringify(cacheData));
  } catch (error) {
    console.error('Failed to cache weather data:', error);
  }
};

// Retrieve cached weather data
export const getCachedWeatherData = (city: string) => {
  try {
    const cached = localStorage.getItem(`weather_cache_${city}`);
    if (!cached) return null;

    const cacheData = JSON.parse(cached);
    const now = Date.now();
    const cacheAge = now - cacheData.timestamp;

    // Cache valid for 30 minutes
    if (cacheAge > 30 * 60 * 1000) {
      localStorage.removeItem(`weather_cache_${city}`);
      return null;
    }

    return cacheData.data;
  } catch (error) {
    console.error('Failed to retrieve cached data:', error);
    return null;
  }
};

// Check if app is online
export const isOnline = () => {
  return navigator.onLine;
};
