'use client';
import { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const AQI_LEVELS: Record<number, { label: string; color: string; text: string; bg: string }> = {
  1: { label: 'Good', color: 'text-green-400', text: 'Air quality is excellent', bg: 'bg-green-500/20' },
  2: { label: 'Fair', color: 'text-yellow-400', text: 'Air quality is acceptable', bg: 'bg-yellow-500/20' },
  3: { label: 'Moderate', color: 'text-orange-400', text: 'May affect sensitive groups', bg: 'bg-orange-500/20' },
  4: { label: 'Poor', color: 'text-red-400', text: 'Unhealthy for everyone', bg: 'bg-red-500/20' },
  5: { label: 'Very Poor', color: 'text-purple-400', text: 'Health alert: avoid outdoor activity', bg: 'bg-purple-500/20' },
};

export default function AirQuality({ 
  aqi, 
  components 
}: { 
  aqi: number, 
  components?: {
    pm2_5?: number;
    pm10?: number;
    co?: number;
    no2?: number;
    o3?: number;
    so2?: number;
  } 
}) {
  const [expanded, setExpanded] = useState(false);
  const level = AQI_LEVELS[aqi] || AQI_LEVELS[1];

  const pollutants = components ? [
    { name: 'PM2.5', value: components.pm2_5, unit: 'µg/m³', safe: 10 },
    { name: 'PM10', value: components.pm10, unit: 'µg/m³', safe: 20 },
    { name: 'CO', value: components.co, unit: 'µg/m³', safe: 4000 },
    { name: 'NO₂', value: components.no2, unit: 'µg/m³', safe: 40 },
    { name: 'O₃', value: components.o3, unit: 'µg/m³', safe: 100 },
    { name: 'SO₂', value: components.so2, unit: 'µg/m³', safe: 20 },
  ] : [];

  return (
    <div className={`backdrop-blur-xl ${level.bg} rounded-2xl p-3 border border-white/20 animate-fade-in`}>
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <h3 className="text-white font-light text-sm">Air Quality</h3>
        {components && (
          expanded ? 
            <ChevronUpIcon className="w-4 h-4 text-white/60" /> : 
            <ChevronDownIcon className="w-4 h-4 text-white/60" />
        )}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div>
          <p className={`${level.color} text-base font-light`}>{level.label}</p>
          <p className="text-white/70 text-xs mt-0.5">{level.text}</p>
        </div>
        <div className={`w-12 h-12 ${level.bg} border-2 ${level.color.replace('text-', 'border-')} rounded-full flex items-center justify-center`}>
          <span className={`${level.color} text-xl font-bold`}>{aqi}</span>
        </div>
      </div>

      {/* Expanded Pollutant Details */}
      {expanded && components && (
        <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
          {pollutants.map((pollutant, i) => {
            const isHigh = pollutant.value && pollutant.value > pollutant.safe;
            return (
              <div key={i} className={`backdrop-blur-lg ${isHigh ? 'bg-red-500/10' : 'bg-white/5'} rounded-lg p-2`}>
                <p className="text-white/60 text-xs">{pollutant.name}</p>
                <p className={`${isHigh ? 'text-red-400' : 'text-white'} text-sm font-light`}>
                  {pollutant.value?.toFixed(1) || 'N/A'}
                </p>
                <p className="text-white/40 text-xs">{pollutant.unit}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
