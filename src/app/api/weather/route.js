import { NextResponse } from 'next/server';
import axios from 'axios';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    if (!city && (!lat || !lon)) {
      return NextResponse.json(
        { success: false, error: 'City name or coordinates required' },
        { status: 400 }
      );
    }

    // Fetch current weather
    let weatherUrl;
    if (city) {
      weatherUrl = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
    } else {
      weatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    }

    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;

    const weatherLat = weatherData.coord.lat;
    const weatherLon = weatherData.coord.lon;

    // Fetch 5-day forecast
    const forecastUrl = `${BASE_URL}/forecast?lat=${weatherLat}&lon=${weatherLon}&appid=${API_KEY}`;
    const forecastResponse = await axios.get(forecastUrl);

    // Fetch air quality
    const aqiUrl = `${BASE_URL}/air_pollution?lat=${weatherLat}&lon=${weatherLon}&appid=${API_KEY}`;
    const aqiResponse = await axios.get(aqiUrl);
    const aqiData = aqiResponse.data.list[0];

    // Fetch One Call API (hourly, UV, alerts)
    let hourlyData = [];
    let uvi = 0;
    let alerts = [];
    
    try {
      const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${weatherLat}&lon=${weatherLon}&exclude=minutely,daily&appid=${API_KEY}`;
      const oneCallResponse = await axios.get(oneCallUrl);
      
      hourlyData = oneCallResponse.data.hourly || [];
      uvi = oneCallResponse.data.current?.uvi || 0;
      alerts = oneCallResponse.data.alerts || [];
    } catch (err) {
      try {
        const oneCallV2Url = `${BASE_URL}/onecall?lat=${weatherLat}&lon=${weatherLon}&exclude=minutely,daily&appid=${API_KEY}`;
        const oneCallV2Response = await axios.get(oneCallV2Url);
        
        hourlyData = oneCallV2Response.data.hourly || [];
        uvi = oneCallV2Response.data.current?.uvi || 0;
        alerts = oneCallV2Response.data.alerts || [];
      } catch (err2) {
        hourlyData = forecastResponse.data.list.slice(0, 24).map(item => ({
          dt: item.dt,
          temp: item.main.temp,
          pop: item.pop || 0,
          wind_speed: item.wind.speed || 0,
          weather: item.weather,
          feels_like: item.main.feels_like,
        }));
        
        const currentHour = new Date().getHours();
        const isDaytime = currentHour >= 6 && currentHour <= 18;
        const isCloudyClear = weatherData.weather[0].main === 'Clear';
        uvi = isDaytime ? (isCloudyClear ? 5 : 2) : 0;
      }
    }

    // ===== FREE POLLEN DATA with FALLBACK INDICATION =====
    let pollenData = { 
      overall: 0, 
      tree: 0, 
      grass: 0, 
      weed: 0, 
      available: false, 
      source: 'unavailable' 
    };
    
    try {
      const openMeteoUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${weatherLat}&longitude=${weatherLon}&current=european_aqi,alder_pollen,birch_pollen,grass_pollen,ragweed_pollen&timezone=auto`;
      const pollenResponse = await axios.get(openMeteoUrl);
      
      const current = pollenResponse.data.current;
      
      // Check if any pollen data exists (not null)
      const hasPollenData = 
        current.alder_pollen !== null || 
        current.birch_pollen !== null || 
        current.grass_pollen !== null || 
        current.ragweed_pollen !== null;
      
      if (hasPollenData) {
        // Calculate pollen levels (0-5 scale)
        const alderLevel = scalePollenLevel(current.alder_pollen || 0);
        const birchLevel = scalePollenLevel(current.birch_pollen || 0);
        const grassLevel = scalePollenLevel(current.grass_pollen || 0);
        const ragweedLevel = scalePollenLevel(current.ragweed_pollen || 0);
        
        // Tree pollen = average of alder and birch
        const treeLevel = Math.round((alderLevel + birchLevel) / 2);
        
        // Weed pollen = ragweed
        const weedLevel = ragweedLevel;
        
        pollenData = {
          overall: Math.max(treeLevel, grassLevel, weedLevel),
          tree: treeLevel,
          grass: grassLevel,
          weed: weedLevel,
          available: true,
          source: 'open-meteo'
        };
      } else {
        // Data exists but all values are null (not monitored in this region)
        console.log('Pollen monitoring not available for this region');
        pollenData = {
          overall: 0,
          tree: 0,
          grass: 0,
          weed: 0,
          available: false,
          source: 'not-available-for-region'
        };
      }
      
    } catch (pollenErr) {
      console.log('Open-Meteo pollen API error:', pollenErr.message);
      // API request failed
      pollenData = {
        overall: 0,
        tree: 0,
        grass: 0,
        weed: 0,
        available: false,
        source: 'api-error'
      };
    }

    // Process daily forecast
    const dailyForecast = [];
    const processedDates = new Set();
    
    forecastResponse.data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      if (!processedDates.has(date) && dailyForecast.length < 5) {
        dailyForecast.push({
          dt: item.dt,
          temp: {
            min: item.main.temp_min,
            max: item.main.temp_max,
          },
          weather: item.weather,
          description: item.weather[0].description,
          pop: item.pop || 0,
        });
        processedDates.add(date);
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        current: weatherData,
        forecast: dailyForecast,
        hourly: hourlyData,
        uvi: uvi,
        aqi: aqiData.main.aqi,
        aqiComponents: {
          pm2_5: aqiData.components.pm2_5,
          pm10: aqiData.components.pm10,
          co: aqiData.components.co,
          no2: aqiData.components.no2,
          o3: aqiData.components.o3,
          so2: aqiData.components.so2,
        },
        pollen: pollenData, // Now includes availability status
        alerts: alerts,
      },
    });

  } catch (error) {
    console.error('Weather API Error:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      return NextResponse.json(
        { success: false, error: 'Invalid API key. Please check your OpenWeather API configuration.' },
        { status: 401 }
      );
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { success: false, error: 'City not found. Please check the spelling and try again.' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: error.response?.data?.message || 'Failed to fetch weather data. Please try again later.' },
      { status: error.response?.status || 500 }
    );
  }
}

// Helper function to scale pollen counts to 0-5 range
function scalePollenLevel(count) {
  // Handle null/undefined
  if (count === null || count === undefined) return 0;
  
  // Open-Meteo provides counts in grains/m³
  // Scale to 0-5 based on common thresholds
  if (count === 0) return 0;
  if (count < 10) return 1;   // Low
  if (count < 50) return 2;   // Low-Moderate
  if (count < 100) return 3;  // Moderate
  if (count < 200) return 4;  // High
  return 5;                   // Very High
}
