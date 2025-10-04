'use client';
import { SparklesIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';

interface PollenData {
  overall: number;
  tree: number;
  grass: number;
  weed: number;
  available?: boolean;
  source?: string;
}

const POLLEN_LEVELS = {
  0: { label: 'None', color: 'text-gray-400', bg: 'bg-gray-500/20' },
  1: { label: 'Low', color: 'text-green-400', bg: 'bg-green-500/20' },
  2: { label: 'Low-Moderate', color: 'text-yellow-400', bg: 'bg-yellow-500/20' },
  3: { label: 'Moderate', color: 'text-orange-400', bg: 'bg-orange-500/20' },
  4: { label: 'High', color: 'text-red-400', bg: 'bg-red-500/20' },
  5: { label: 'Very High', color: 'text-purple-400', bg: 'bg-purple-500/20' },
};

export default function PollenIndex({ data }: { data: PollenData }) {
  // FIX: Check explicitly for available flag, not just truthy values
  const isDataAvailable = data?.available === true;

  // If explicitly marked as unavailable
  if (data?.available === false || !isDataAvailable) {
    return (
      <div className="backdrop-blur-2xl bg-gray-500/20 rounded-2xl p-3 border border-white/30">
        <h3 className="text-white font-light text-sm mb-2 flex items-center gap-2">
          <SparklesIcon className="w-5 h-5" />
          Pollen & Allergies
        </h3>

        {/* Unavailable State */}
        <div className="flex flex-col items-center justify-center py-4">
          <ExclamationCircleIcon className="w-12 h-12 text-white/30 mb-2" />
          <p className="text-white/60 text-sm text-center mb-1">Data Not Available</p>
          <p className="text-white/40 text-xs text-center leading-relaxed">
            {data?.source === 'not-available-for-region' 
              ? 'Pollen monitoring not available in this region'
              : data?.source === 'api-error'
              ? 'Unable to fetch pollen data at this time'
              : 'Pollen data unavailable for this location'}
          </p>
        </div>

        {/* Info note */}
        <div className="mt-3 pt-3 border-t border-white/25">
          <p className="text-white/40 text-xs">
            💡 Pollen data is monitored in Europe and North America
          </p>
        </div>
      </div>
    );
  }

  const level = POLLEN_LEVELS[Math.min(5, data.overall) as keyof typeof POLLEN_LEVELS];

  return (
    <div className={`backdrop-blur-2xl ${level.bg} rounded-2xl p-3 border border-white/30`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-white font-light text-sm flex items-center gap-2">
          <SparklesIcon className="w-5 h-5" />
          Pollen & Allergies
        </h3>
        {/* Live data indicator */}
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/60 text-xs">Live</span>
        </div>
      </div>

      {/* Overall Level */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className={`${level.color} text-lg font-light`}>{level.label}</p>
          <p className="text-white/60 text-xs">Overall Risk</p>
        </div>
        <div className={`w-12 h-12 ${level.bg} border-2 ${level.color.replace('text-', 'border-')} rounded-full flex items-center justify-center`}>
          <span className={`${level.color} text-xl font-bold`}>{data.overall}</span>
        </div>
      </div>

      {/* Pollen Types Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        <PollenType icon="🌳" label="Tree" value={data.tree} />
        <PollenType icon="🌾" label="Grass" value={data.grass} />
        <PollenType icon="🌿" label="Weed" value={data.weed} />
      </div>

      {/* Health advice */}
      <p className="text-white/60 text-xs mt-2">
        {data.overall >= 4 ? '⚠️ High allergy risk. Consider medication.' : 
         data.overall >= 3 ? '🟡 Moderate risk. Monitor symptoms.' :
         data.overall >= 1 ? '✅ Low allergy risk. Safe for outdoor activities.' :
         '❄️ No pollen detected. Excellent conditions.'}
      </p>

      {/* Data source indicator */}
      <p className="text-white/40 text-xs mt-1">
        Source: Open-Meteo
      </p>
    </div>
  );
}

function PollenType({ icon, label, value }: { icon: string, label: string, value: number }) {
  const getColor = (val: number) => {
    if (val >= 4) return 'text-red-400';
    if (val >= 3) return 'text-orange-400';
    if (val >= 2) return 'text-yellow-400';
    if (val >= 1) return 'text-green-400';
    return 'text-gray-400';
  };

  return (
    <div className="backdrop-blur-lg bg-white/15 rounded-lg p-2 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <p className="text-white/60 text-xs">{label}</p>
      <p className={`${getColor(value)} text-sm font-medium`}>
        {value === 0 ? '0' : `${value}/5`}
      </p>
    </div>
  );
}
