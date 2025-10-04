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

    // Build API URL based on parameters
    let url;
    if (city) {
      url = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}`;
    } else {
      url = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    }

    const response = await axios.get(url);
    
    return NextResponse.json({
      success: true,
      data: response.data,
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