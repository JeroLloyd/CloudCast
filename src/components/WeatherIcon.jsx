import { 
  SunIcon, 
  CloudIcon, 
  CloudIcon as RainIcon,
  BoltIcon,
  CloudIcon as SnowIcon 
} from '@heroicons/react/24/solid';

export default function WeatherIcon({ condition, size = 'medium' }) {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32',
  };

  const iconMap = {
    Clear: <SunIcon className={`${sizeClasses[size]} text-yellow-300`} />,
    Clouds: <CloudIcon className={`${sizeClasses[size]} text-white/80`} />,
    Rain: <RainIcon className={`${sizeClasses[size]} text-blue-300`} />,
    Drizzle: <RainIcon className={`${sizeClasses[size]} text-blue-200`} />,
    Thunderstorm: <BoltIcon className={`${sizeClasses[size]} text-yellow-400`} />,
    Snow: <SnowIcon className={`${sizeClasses[size]} text-blue-100`} />,
    Mist: <CloudIcon className={`${sizeClasses[size]} text-gray-300`} />,
    Smoke: <CloudIcon className={`${sizeClasses[size]} text-gray-400`} />,
    Haze: <CloudIcon className={`${sizeClasses[size]} text-gray-300`} />,
    Dust: <CloudIcon className={`${sizeClasses[size]} text-orange-300`} />,
    Fog: <CloudIcon className={`${sizeClasses[size]} text-gray-400`} />,
    Sand: <CloudIcon className={`${sizeClasses[size]} text-yellow-600`} />,
    Ash: <CloudIcon className={`${sizeClasses[size]} text-gray-500`} />,
  };

  return (
    <div className="animate-float">
      {iconMap[condition] || iconMap.Clear}
    </div>
  );
}