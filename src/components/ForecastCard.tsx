'use client';
import WeatherIcon from './WeatherIcon';

interface ForecastDay {
  dt: number;
  temp: { min: number; max: number };
  weather: Array<{ main: string; description: string }>;
}

export default function ForecastCard({ forecast, unit }: { forecast: ForecastDay[], unit: string }) {
  const getDayName = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const convertTemp = (kelvin: number) => {
    return unit === 'C' 
      ? Math.round(kelvin - 273.15)
      : Math.round((kelvin - 273.15) * 9/5 + 32);
  };

  if (!forecast || forecast.length === 0) return null;

  return (
    <div className="mt-3 backdrop-blur-2xl bg-white/18 rounded-2xl p-3 sm:p-4 border border-white/30 animate-fade-in">
      <h3 className="text-white font-light text-sm sm:text-base mb-2">5-Day Forecast</h3>
      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {forecast.slice(0, 5).map((day, i) => (
          <div key={i} className="text-center backdrop-blur-lg bg-white/15 rounded-xl p-1.5 hover:bg-white/18 transition-all">
            <p className="text-white/70 text-xs mb-1 font-light">
              {i === 0 ? 'Today' : getDayName(day.dt)}
            </p>
            <div className="flex justify-center mb-1">
              <WeatherIcon condition={day.weather[0].main} size="small" />
            </div>
            <div className="text-white">
              <div className="text-sm font-light">
                {convertTemp(day.temp.max)}°
              </div>
              <div className="text-white/50 text-xs">
                {convertTemp(day.temp.min)}°
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
