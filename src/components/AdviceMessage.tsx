'use client';
import { getWeatherAdvice } from '@/lib/weatherUtils';
import { LightBulbIcon } from '@heroicons/react/24/outline';

export default function AdviceMessage({ weatherMain, temp }) {
  const advice = getWeatherAdvice(weatherMain, temp);

  return (
    <div className="mt-3 backdrop-blur-2xl bg-white/18 rounded-2xl p-3 
                  border border-white/30 flex items-start gap-2">
      <LightBulbIcon className="w-5 h-5 text-yellow-300 flex-shrink-0 mt-0.5" />
      <p className="text-white/90 font-light text-sm">{advice}</p>
    </div>
  );
}
