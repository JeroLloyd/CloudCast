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

    // Build API URL for current weather
    let weatherUrl;
    if (city) {
      weatherUrl = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
    } else {
      weatherUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    }

    // Fetch current weather
    const weatherResponse = await axios.get(weatherUrl);
    const weatherData = weatherResponse.data;

    // Get coordinates for additional data
    const weatherLat = weatherData.coord.lat;
    const weatherLon = weatherData.coord.lon;

    // Fetch 5-day forecast
    const forecastUrl = `${BASE_URL}/forecast?lat=${weatherLat}&lon=${weatherLon}&appid=${API_KEY}`;
    const forecastResponse = await axios.get(forecastUrl);

    // Fetch air quality with pollutant details
    const aqiUrl = `${BASE_URL}/air_pollution?lat=${weatherLat}&lon=${weatherLon}&appid=${API_KEY}`;
    const aqiResponse = await axios.get(aqiUrl);
    const aqiData = aqiResponse.data.list[0];

    // Fetch One Call API 3.0 (hourly, UV, alerts)
    let hourlyData = [];
    let uvi = 0;
    let alerts = [];
    
    try {
      // Try One Call API 3.0 first
      const oneCallUrl = `https://api.openweathermap.org/data/3.0/onecall?lat=${weatherLat}&lon=${weatherLon}&exclude=minutely,daily&appid=${API_KEY}`;
      const oneCallResponse = await axios.get(oneCallUrl);
      
      hourlyData = oneCallResponse.data.hourly || [];
      uvi = oneCallResponse.data.current?.uvi || 0;
      alerts = oneCallResponse.data.alerts || [];
    } catch (err) {
      console.log('One Call API 3.0 not available, trying 2.5...');
      
      // Fallback to One Call API 2.5
      try {
        const oneCallV2Url = `${BASE_URL}/onecall?lat=${weatherLat}&lon=${weatherLon}&exclude=minutely,daily&appid=${API_KEY}`;
        const oneCallV2Response = await axios.get(oneCallV2Url);
        
        hourlyData = oneCallV2Response.data.hourly || [];
        uvi = oneCallV2Response.data.current?.uvi || 0;
        alerts = oneCallV2Response.data.alerts || [];
      } catch (err2) {
        console.log('One Call API not available, using forecast data as fallback');
        
        // Fallback to forecast data for hourly (free tier)
        hourlyData = forecastResponse.data.list.slice(0, 24).map(item => ({
          dt: item.dt,
          temp: item.main.temp,
          pop: item.pop || 0,
          wind_speed: item.wind.speed || 0,
          weather: item.weather,
          feels_like: item.main.feels_like,
        }));
        
        // Estimate UV based on time of day and weather
        const currentHour = new Date().getHours();
        const isDaytime = currentHour >= 6 && currentHour <= 18;
        const isCloudyClear = weatherData.weather[0].main === 'Clear';
        uvi = isDaytime ? (isCloudyClear ? 5 : 2) : 0;
      }
    }

    // Process 5-day forecast (get one per day)
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
    
    // Return comprehensive weather data
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
        alerts: alerts,
      },
    });

  } catch (error) {
    console.error('Weather API Error:', error.response?.data || error.message);
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid API key. Please check your OpenWeather API configuration.',
        },
        { status: 401 }
      );
    }
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        {
          success: false,
          error: 'City not found. Please check the spelling and try again.',
        },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch weather data. Please try again later.',
      },
      { status: error.response?.status || 500 }
    );
  }
}
