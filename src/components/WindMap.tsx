'use client';
import { ArrowUpIcon } from '@heroicons/react/24/solid';

export default function WindMap({ 
  windSpeed, 
  windDeg, 
  windGust 
}: { 
  windSpeed: number, 
  windDeg: number, 
  windGust?: number 
}) {
  const speedKmh = Math.round(windSpeed * 3.6);
  const gustKmh = windGust ? Math.round(windGust * 3.6) : null;

  const getWindDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  const getWindStrength = (speed: number) => {
    if (speed < 12) return { label: 'Calm', color: 'text-green-400', bg: 'bg-green-500/20' };
    if (speed < 29) return { label: 'Light', color: 'text-blue-400', bg: 'bg-blue-500/20' };
    if (speed < 39) return { label: 'Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20' };
    if (speed < 50) return { label: 'Strong', color: 'text-orange-400', bg: 'bg-orange-500/20' };
    return { label: 'Very Strong', color: 'text-red-400', bg: 'bg-red-500/20' };
  };

  const strength = getWindStrength(speedKmh);

  return (
    <div className={`backdrop-blur-2xl ${strength.bg} rounded-2xl p-3 border border-white/30`}>
      <h3 className="text-white font-light text-sm mb-3">Wind Conditions</h3>
      
      <div className="flex items-center justify-between">
        {/* Wind Compass */}
        <div className="relative w-24 h-24 rounded-full bg-white/15 border-2 border-white/30">
          {/* Compass directions */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/40 text-xs font-light absolute top-1">N</div>
            <div className="text-white/40 text-xs font-light absolute bottom-1">S</div>
            <div className="text-white/40 text-xs font-light absolute left-1 top-1/2 -translate-y-1/2">W</div>
            <div className="text-white/40 text-xs font-light absolute right-1 top-1/2 -translate-y-1/2">E</div>
          </div>
          
          {/* Wind Arrow */}
          <div 
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `rotate(${windDeg}deg)` }}
          >
            <ArrowUpIcon className={`w-8 h-8 ${strength.color}`} />
          </div>
        </div>

        {/* Wind Stats */}
        <div className="flex-1 ml-4">
          <div className="mb-2">
            <p className="text-white/60 text-xs">Direction</p>
            <p className="text-white text-lg font-light">
              {getWindDirection(windDeg)} ({windDeg}°)
            </p>
          </div>
          
          <div className="mb-2">
            <p className="text-white/60 text-xs">Speed</p>
            <p className={`${strength.color} text-xl font-light`}>
              {speedKmh} km/h
            </p>
            <p className={`${strength.color} text-xs`}>{strength.label}</p>
          </div>

          {gustKmh && (
            <div>
              <p className="text-white/60 text-xs">Gusts</p>
              <p className="text-white text-sm font-light">{gustKmh} km/h</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
