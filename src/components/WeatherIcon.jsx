import { Icon } from '@iconify/react';

export default function WeatherIcon({ condition, size = 'medium' }) {
  const sizeClasses = {
    small: 48,
    medium: 80,
    large: 128,
  };

  const iconMap = {
    Clear: 'meteocons:clear-day-fill',
    Clouds: 'meteocons:cloudy-fill',
    Rain: 'meteocons:rain-fill',
    Drizzle: 'meteocons:drizzle-fill',
    Thunderstorm: 'meteocons:thunderstorms-day-fill',
    Snow: 'meteocons:snow-fill',
    Mist: 'meteocons:mist-fill',
    Smoke: 'meteocons:smoke-fill',
    Haze: 'meteocons:haze-fill',
    Dust: 'meteocons:dust-fill',
    Fog: 'meteocons:fog-fill',
    Sand: 'meteocons:dust-wind-fill',
    Ash: 'meteocons:smoke-fill',
  };

  return (
    <div className="flex justify-center my-4">
      <Icon 
        icon={iconMap[condition] || iconMap.Clear} 
        width={sizeClasses[size]} 
        height={sizeClasses[size]}
        className="drop-shadow-lg"
      />
    </div>
  );
}
