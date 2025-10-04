'use client';
import { CloudIcon, BoltIcon } from '@heroicons/react/24/solid';

interface RainAlertProps {
  hourly: any[];
}

export default function RainAlert({ hourly }: RainAlertProps) {
  if (!hourly || hourly.length === 0) return null;

  // Check for rain in next 3 hours
  const upcomingRain = hourly.slice(0, 3).some(hour => hour.pop > 0.3);
  const highRainChance = hourly.slice(0, 6).filter(hour => hour.pop > 0.6).length;
  const hasThunderstorm = hourly.slice(0, 6).some(hour => 
    hour.weather[0].main === 'Thunderstorm'
  );

  if (!upcomingRain && !hasThunderstorm) return null;

  return (
    <div className="backdrop-blur-xl bg-blue-500/20 border-2 border-blue-400/40 rounded-2xl p-3 animate-pulse">
      <div className="flex items-start gap-2">
        {hasThunderstorm ? (
          <BoltIcon className="w-6 h-6 text-yellow-400 flex-shrink-0 animate-bounce" />
        ) : (
          <CloudIcon className="w-6 h-6 text-blue-400 flex-shrink-0" />
        )}
        <div>
          <h3 className="text-blue-400 font-semibold text-sm mb-1">
            {hasThunderstorm ? '⚡ Thunderstorm Warning' : '🌧️ Rain Alert'}
          </h3>
          <p className="text-white text-xs">
            {hasThunderstorm 
              ? 'Thunderstorms expected in your area. Stay indoors and avoid outdoor activities.'
              : highRainChance > 2
                ? `Heavy rain likely in the next ${highRainChance * 2} hours. Bring an umbrella!`
                : 'Light rain expected soon. Consider bringing an umbrella.'}
          </p>
        </div>
      </div>
    </div>
  );
}
