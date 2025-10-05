import { getWeatherAdvice } from '@/lib/weatherUtils';
import WeatherIcon from './WeatherIcon';

interface WeatherCardProps {
  weather: any;
  unit: string;
  onToggleUnit: () => void;
}

interface StatItemProps {
  label: string;
  value: string | number;
}

export default function WeatherCard({ weather, unit, onToggleUnit }: WeatherCardProps) {
  const temp = unit === 'C' 
    ? Math.round(weather.main.temp - 273.15) 
    : Math.round((weather.main.temp - 273.15) * 9/5 + 32);

  const isDaytime = () => {
    const now = Date.now() / 1000;
    return now >= weather.sys.sunrise && now <= weather.sys.sunset;
  };

  return (
    <div className="backdrop-blur-3xl bg-black/50 rounded-2xl p-6 border border-white/70 shadow-2xl">
      <h2 className="text-3xl font-semibold mb-1 text-white text-readable">
        {weather.name}
      </h2>
      <p className="text-white text-sm font-medium text-readable-subtle mb-2">
        {weather.sys.country}
      </p>

      <WeatherIcon 
        weatherMain={weather.weather[0].main} 
        isDaytime={isDaytime()} 
      />

      <div className="text-7xl font-bold text-white mb-2 text-readable-strong text-center">
        {temp}&deg;{unit}
      </div>

      <p className="text-white text-lg font-semibold capitalize mb-4 text-readable-subtle text-center">
        {weather.weather[0].description}
      </p>

      <button onClick={onToggleUnit}
        className="w-full text-white text-sm font-medium px-4 py-2 bg-white/20 rounded-lg 
                 hover:bg-white/30 transition-all shadow-lg text-readable-subtle border border-white/30 mb-4">
        tap to switch
      </button>

      <div className="grid grid-cols-4 gap-3">
        <StatItem label="Feels" value={`${Math.round(weather.main.feels_like - 273.15)}°`} />
        <StatItem label="Humid" value={`${weather.main.humidity}%`} />
        <StatItem label="Wind" value={`${Math.round(weather.wind.speed)}`} />
        <StatItem label="Press" value={weather.main.pressure} />
      </div>

      <div className="mt-4 p-3 bg-white/15 rounded-lg border border-white/25 shadow-lg">
        <p className="text-white text-sm font-medium text-center text-readable-subtle">
          {getWeatherAdvice(weather.weather[0].main, weather.main.temp)}
        </p>
      </div>
    </div>
  );
}

function StatItem({ label, value }: StatItemProps) {
  return (
    <div className="text-center backdrop-blur-lg bg-white/10 rounded-lg p-2 border border-white/20">
      <p className="text-white text-xs font-semibold mb-1 text-readable-subtle">{label}</p>
      <p className="text-white text-base font-bold text-readable-subtle">{value}</p>
    </div>
  );
}
