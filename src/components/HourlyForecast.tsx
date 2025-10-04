'use client';
import { CloudIcon, SunIcon } from '@heroicons/react/24/outline';

interface HourlyData {
  dt: number;
  temp: number;
  pop: number; // Probability of precipitation
  wind_speed: number;
  weather: Array<{ main: string; description: string }>;
}

export default function HourlyForecast({ hourly, unit }: { hourly: HourlyData[], unit: string }) {
  const getHourTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true,
    });
  };

  const convertTemp = (kelvin: number) => {
    return unit === 'C' 
      ? Math.round(kelvin - 273.15)
      : Math.round((kelvin - 273.15) * 9/5 + 32);
  };

  if (!hourly || hourly.length === 0) return null;

  return (
    <div className="backdrop-blur-2xl bg-white/18 rounded-2xl p-3 border border-white/30">
      <h3 className="text-white font-light text-sm mb-2">Hourly Forecast (Next 24h)</h3>
      <div className="flex gap-2 overflow-x-auto custom-scrollbar pb-2">
        {hourly.slice(0, 24).map((hour, i) => (
          <div key={i} className="flex-shrink-0 text-center backdrop-blur-lg bg-white/15 rounded-xl p-2 min-w-[70px]">
            <p className="text-white/70 text-xs mb-1 font-light">
              {i === 0 ? 'Now' : getHourTime(hour.dt)}
            </p>
            
            {/* Weather Icon */}
            <div className="flex justify-center mb-1">
              {hour.weather[0].main === 'Clear' ? (
                <SunIcon className="w-6 h-6 text-yellow-300" />
              ) : (
                <CloudIcon className="w-6 h-6 text-white/80" />
              )}
            </div>
            
            {/* Temperature */}
            <p className="text-white text-sm font-light mb-1">
              {convertTemp(hour.temp)}°
            </p>
            
            {/* Rain Probability */}
            {hour.pop > 0 && (
              <p className="text-blue-300 text-xs">
                💧 {Math.round(hour.pop * 100)}%
              </p>
            )}
            
            {/* Wind Speed */}
            <p className="text-white/50 text-xs">
              🌬 {Math.round(hour.wind_speed * 3.6)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
