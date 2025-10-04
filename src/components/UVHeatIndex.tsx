'use client';
import { SunIcon, FireIcon } from '@heroicons/react/24/solid';

interface UVHeatProps {
  uvi: number;
  temp: number;
  humidity: number;
}

const UV_LEVELS = {
  low: { range: [0, 2], color: 'text-green-400', bg: 'bg-green-500/20', label: 'Low', advice: 'No protection needed' },
  moderate: { range: [3, 5], color: 'text-yellow-400', bg: 'bg-yellow-500/20', label: 'Moderate', advice: 'Wear sunscreen' },
  high: { range: [6, 7], color: 'text-orange-400', bg: 'bg-orange-500/20', label: 'High', advice: 'Protection required' },
  veryHigh: { range: [8, 10], color: 'text-red-400', bg: 'bg-red-500/20', label: 'Very High', advice: 'Extra protection needed' },
  extreme: { range: [11, 20], color: 'text-purple-400', bg: 'bg-purple-500/20', label: 'Extreme', advice: 'Avoid sun exposure' },
};

export default function UVHeatIndex({ uvi, temp, humidity }: UVHeatProps) {
  // Calculate heat index (feels like with humidity)
  const tempC = temp - 273.15;
  const heatIndex = tempC + (0.5555 * ((humidity / 100) * 6.112 * Math.exp(17.67 * tempC / (tempC + 243.5)) - 10));
  
  // Determine UV level
  let uvLevel = UV_LEVELS.low;
  Object.values(UV_LEVELS).forEach(level => {
    if (uvi >= level.range[0] && uvi <= level.range[1]) {
      uvLevel = level;
    }
  });

  const heatWarning = heatIndex > 32; // Heat index > 32°C is dangerous

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-3 border border-white/20">
      <h3 className="text-white font-light text-sm mb-2">Health & Safety</h3>
      
      {/* UV Index */}
      <div className={`${uvLevel.bg} rounded-xl p-2 mb-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SunIcon className={`w-6 h-6 ${uvLevel.color}`} />
            <div>
              <p className="text-white/60 text-xs">UV Index</p>
              <p className={`${uvLevel.color} text-sm font-medium`}>{uvLevel.label}</p>
            </div>
          </div>
          <span className={`${uvLevel.color} text-xl font-bold`}>{uvi}</span>
        </div>
        <p className="text-white/70 text-xs mt-1">{uvLevel.advice}</p>
      </div>

      {/* Heat Index */}
      <div className={`${heatWarning ? 'bg-red-500/20 border border-red-400/40' : 'bg-white/5'} rounded-xl p-2`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FireIcon className={`w-6 h-6 ${heatWarning ? 'text-red-400' : 'text-orange-400'}`} />
            <div>
              <p className="text-white/60 text-xs">Heat Index</p>
              <p className={`${heatWarning ? 'text-red-400' : 'text-white'} text-sm font-medium`}>
                {Math.round(heatIndex)}°C
              </p>
            </div>
          </div>
        </div>
        {heatWarning && (
          <p className="text-red-400 text-xs mt-1 font-medium">
            ⚠️ Heat stroke risk! Stay hydrated and avoid sun exposure.
          </p>
        )}
      </div>
    </div>
  );
}
