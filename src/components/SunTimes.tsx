'use client';
import { Icon } from '@iconify/react';

export default function SunTimes({ sunrise, sunset }: { sunrise: number, sunset: number }) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="mt-3 backdrop-blur-2xl bg-white/18 rounded-2xl p-3 border border-white/30 animate-fade-in">
      <h3 className="text-white font-light text-sm mb-2">Sun Schedule</h3>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 backdrop-blur-lg bg-white/15 rounded-xl p-2">
          <Icon 
            icon="meteocons:sunrise-fill" 
            className="w-8 h-8 text-yellow-300 flex-shrink-0"
          />
          <div>
            <p className="text-white/60 text-xs font-light">Sunrise</p>
            <p className="text-white text-sm font-light">{formatTime(sunrise)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 backdrop-blur-lg bg-white/15 rounded-xl p-2">
          <Icon 
            icon="meteocons:sunset-fill" 
            className="w-8 h-8 text-orange-400 flex-shrink-0"
          />
          <div>
            <p className="text-white/60 text-xs font-light">Sunset</p>
            <p className="text-white text-sm font-light">{formatTime(sunset)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
