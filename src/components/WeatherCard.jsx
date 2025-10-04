'use client';
import WeatherIcon from './WeatherIcon';
import AdviceMessage from './AdviceMessage';

export default function WeatherCard({ weather, unit, onToggleUnit }) {
  if (!weather) return null;

  const temp = unit === 'C' 
    ? Math.round(weather.main.temp - 273.15) 
    : Math.round((weather.main.temp - 273.15) * 9/5 + 32);

  return (
    <div className="backdrop-blur-2xl bg-white/10 rounded-2xl p-3 border border-white/20 shadow-2xl">
      
      {/* Location */}
      <div className="text-center mb-2">
        <h2 className="text-xl font-light text-white">{weather.name}</h2>
        <p className="text-white/70 text-xs font-light">{weather.sys.country}</p>
      </div>

      {/* Temperature & Icon - Side by Side */}
      <div className="flex items-center justify-center gap-4 mb-2">
        <WeatherIcon condition={weather.weather[0].main} size="medium" />
        <div onClick={onToggleUnit} className="cursor-pointer group">
          <div className="text-5xl font-thin text-white transition-transform group-hover:scale-105">
            {temp}°{unit}
          </div>
          <p className="text-white/60 text-xs text-center">tap to switch</p>
        </div>
      </div>

      {/* Weather description */}
      <p className="text-center text-base font-light text-white/90 mb-2 capitalize">
        {weather.weather[0].description}
      </p>

      {/* Weather details grid */}
      <div className="grid grid-cols-4 gap-1.5">
        <WeatherDetail 
          label="Feels" 
          value={`${unit === 'C' 
            ? Math.round(weather.main.feels_like - 273.15) 
            : Math.round((weather.main.feels_like - 273.15) * 9/5 + 32)}°`} 
        />
        <WeatherDetail label="Humid" value={`${weather.main.humidity}%`} />
        <WeatherDetail label="Wind" value={`${Math.round(weather.wind.speed * 3.6)}`} />
        <WeatherDetail label="Press" value={`${weather.main.pressure}`} />
      </div>

      {/* Advice */}
      <AdviceMessage weatherMain={weather.weather[0].main} temp={weather.main.temp} />
    </div>
  );
}

function WeatherDetail({ label, value }) {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-lg p-1.5 border border-white/10 text-center">
      <p className="text-white/60 text-xs font-light">{label}</p>
      <p className="text-white text-sm font-light">{value}</p>
    </div>
  );
}
