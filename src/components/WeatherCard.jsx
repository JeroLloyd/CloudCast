'use client';
import WeatherIcon from './WeatherIcon';
import AdviceMessage from './AdviceMessage';

export default function WeatherCard({ weather, unit, onToggleUnit }) {
  if (!weather) return null;

  const temp = unit === 'C' 
    ? Math.round(weather.main.temp - 273.15) 
    : Math.round((weather.main.temp - 273.15) * 9/5 + 32);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Main weather card */}
      <div className="backdrop-blur-2xl bg-white/10 rounded-3xl p-8 
                    border border-white/20 shadow-2xl">
        
        {/* Location */}
        <div className="text-center mb-6">
          <h2 className="text-3xl font-light text-white mb-1">
            {weather.name}
          </h2>
          <p className="text-white/70 text-sm font-light">
            {weather.sys.country}
          </p>
        </div>

        {/* Weather icon and temperature */}
        <div className="flex items-center justify-center mb-6">
          <WeatherIcon condition={weather.weather[0].main} size="large" />
        </div>

        {/* Temperature with toggle */}
        <div 
          onClick={onToggleUnit}
          className="text-center cursor-pointer group mb-4"
        >
          <div className="text-7xl font-thin text-white mb-2 
                        transition-transform group-hover:scale-105">
            {temp}°{unit}
          </div>
          <p className="text-white/60 text-sm">Tap to switch units</p>
        </div>

        {/* Weather description */}
        <p className="text-center text-2xl font-light text-white/90 mb-8 capitalize">
          {weather.weather[0].description}
        </p>

        {/* Weather details grid */}
        <div className="grid grid-cols-2 gap-4">
          <WeatherDetail 
            label="Feels Like" 
            value={`${unit === 'C' 
              ? Math.round(weather.main.feels_like - 273.15) 
              : Math.round((weather.main.feels_like - 273.15) * 9/5 + 32)}°${unit}`} 
          />
          <WeatherDetail 
            label="Humidity" 
            value={`${weather.main.humidity}%`} 
          />
          <WeatherDetail 
            label="Wind Speed" 
            value={`${Math.round(weather.wind.speed * 3.6)} km/h`} 
          />
          <WeatherDetail 
            label="Pressure" 
            value={`${weather.main.pressure} hPa`} 
          />
        </div>
      </div>

      {/* Advice message */}
      <AdviceMessage 
        weatherMain={weather.weather[0].main} 
        temp={weather.main.temp} 
      />
    </div>
  );
}

function WeatherDetail({ label, value }) {
  return (
    <div className="backdrop-blur-xl bg-white/5 rounded-2xl p-4 
                  border border-white/10">
      <p className="text-white/60 text-sm font-light mb-1">{label}</p>
      <p className="text-white text-xl font-light">{value}</p>
    </div>
  );
}