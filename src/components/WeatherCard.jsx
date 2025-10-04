import { getWeatherAdvice } from '@/lib/weatherUtils';

export default function WeatherCard({ weather, unit, onToggleUnit }) {
  const temp = unit === 'C' 
    ? Math.round(weather.main.temp - 273.15) 
    : Math.round((weather.main.temp - 273.15) * 9/5 + 32);

  return (
    <div className="backdrop-blur-2xl bg-white/15 rounded-2xl p-4 border border-white/25 shadow-xl">
      {/* City Name */}
      <h2 className="text-white text-2xl font-light mb-1 text-readable">
        {weather.name}
      </h2>
      <p className="text-white/95 text-sm text-readable-subtle">
        {weather.sys.country}
      </p>

      {/* Temperature */}
      <div className="text-6xl font-thin text-white mt-4 mb-2 text-readable-strong">
        {temp}°{unit}
      </div>

      {/* Weather description */}
      <p className="text-white/90 text-base capitalize mb-3 text-readable-subtle">
        {weather.weather[0].description}
      </p>

      {/* Toggle button */}
      <button
        onClick={onToggleUnit}
        className="text-white/90 text-sm px-3 py-1 bg-white/15 rounded-lg 
                 hover:bg-white/25 transition-all text-readable-subtle"
      >
        tap to switch
      </button>

      {/* Stats grid */}
      <div className="grid grid-cols-4 gap-3 mt-4">
        <StatItem 
          label="Feels" 
          value={`${Math.round(weather.main.feels_like - 273.15)}°`} 
        />
        <StatItem 
          label="Humid" 
          value={`${weather.main.humidity}%`} 
        />
        <StatItem 
          label="Wind" 
          value={`${Math.round(weather.wind.speed)}`} 
        />
        <StatItem 
          label="Press" 
          value={weather.main.pressure} 
        />
      </div>

      {/* Weather advice */}
      <div className="mt-4 p-2 bg-white/18 rounded-lg border border-white/15">
        <p className="text-white/85 text-xs text-center text-readable-subtle">
          💡 {getWeatherAdvice(weather.weather[0].main, weather.main.temp)}
        </p>
      </div>
    </div>
  );
}

function StatItem({ label, value }) {
  return (
    <div className="text-center">
      <p className="text-white/70 text-xs mb-1 text-readable-subtle">{label}</p>
      <p className="text-white text-sm font-medium text-readable-subtle">{value}</p>
    </div>
  );
}
