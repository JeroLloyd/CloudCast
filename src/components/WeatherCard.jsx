import ReactAnimatedWeather from 'react-animated-weather';
import { getWeatherAdvice } from '@/lib/weatherUtils';

const weatherIconMap = {
  Clear: 'CLEAR_DAY',
  Clouds: 'CLOUDY',
  Rain: 'RAIN',
  Drizzle: 'SLEET',
  Thunderstorm: 'WIND',
  Snow: 'SNOW',
  Mist: 'FOG',
  Smoke: 'FOG',
  Haze: 'FOG',
  Dust: 'FOG',
  Fog: 'FOG',
  Sand: 'FOG',
  Ash: 'FOG',
  Squall: 'WIND',
  Tornado: 'WIND',
};

export default function WeatherCard({ weather, unit, onToggleUnit }) {
  const temp =
    unit === 'C'
      ? Math.round(weather.main.temp - 273.15)
      : Math.round((weather.main.temp - 273.15) * 9 / 5 + 32);
  const mainWeather = weather.weather[0].main;
  const icon = weatherIconMap[mainWeather] || 'CLOUDY';

  return (
    <div className="backdrop-blur-2xl bg-white/15 rounded-xl p-5 border border-white/25 shadow-xl flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-white text-2xl font-light">{weather.name}</h2>
          <p className="text-white/80 text-sm">{weather.sys.country}</p>
        </div>
        <button
          onClick={onToggleUnit}
          className="text-white/90 text-xs px-3 py-1 bg-white/15 rounded-md hover:bg-white/25 transition-all"
        >
          tap to switch
        </button>
      </div>

      {/* Main weather info */}
      <div className="flex items-center justify-start gap-5 mt-2">
        <ReactAnimatedWeather icon={icon} color="white" size={80} animate />
        <div>
          <p className="text-white text-6xl font-thin leading-tight">
            {temp}°{unit}
          </p>
          <p className="text-white/90 text-lg capitalize mt-1">
            {weather.weather[0].description}
          </p>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-2 mt-3">
        <StatItem label="Feels" value={`${Math.round(weather.main.feels_like - 273.15)}°`} />
        <StatItem label="Humid" value={`${weather.main.humidity}%`} />
        <StatItem label="Wind" value={`${Math.round(weather.wind.speed)}`} />
        <StatItem label="Press" value={weather.main.pressure} />
      </div>

      {/* Advice */}
      <div className="mt-3 p-2 bg-white/20 rounded-lg border border-white/15">
        <p className="text-white/90 text-xs text-center">
          💡 {getWeatherAdvice(weather.weather[0].main, weather.main.temp)}
        </p>
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-white/70 text-xs">{label}</p>
      <p className="text-white text-sm font-medium">{value}</p>
    </div>
  );
}
