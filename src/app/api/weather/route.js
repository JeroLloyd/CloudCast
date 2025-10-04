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
        { error: 'City name or coordinates required' },
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

    // Fetch forecast (5-day)
    const forecastUrl = `${BASE_URL}/forecast?lat=${weatherLat}&lon=${weatherLon}&appid=${API_KEY}`;
    const forecastResponse = await axios.get(forecastUrl);

    // Fetch air quality
    const aqiUrl = `${BASE_URL}/air_pollution?lat=${weatherLat}&lon=${weatherLon}&appid=${API_KEY}`;
    const aqiResponse = await axios.get(aqiUrl);

    // Fetch weather alerts (One Call API 3.0 - may require subscription)
    let alerts = [];
    try {
      const alertsUrl = `${BASE_URL}/onecall?lat=${weatherLat}&lon=${weatherLon}&exclude=minutely,hourly&appid=${API_KEY}`;
      const alertsResponse = await axios.get(alertsUrl);
      alerts = alertsResponse.data.alerts || [];
    } catch (err) {
      // Alerts not available on free tier
      console.log('Weather alerts not available');
    }

    // Process 5-day forecast (get one per day at noon)
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
        });
        processedDates.add(date);
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        current: weatherData,
        forecast: dailyForecast,
        aqi: aqiResponse.data.list[0].main.aqi,
        alerts: alerts,
      },
    });

  } catch (error) {
    console.error('Weather API Error:', error.response?.data || error.message);
    
    return NextResponse.json(
      {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch weather data',
      },
      { status: error.response?.status || 500 }
    );
  }
}
