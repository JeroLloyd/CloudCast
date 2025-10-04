'use client';
import { getWeatherAdvice } from '@/lib/weatherUtils';
import { LightBulbIcon } from '@heroicons/react/24/outline';

export default function AdviceMessage({ weatherMain, temp }) {
  const advice = getWeatherAdvice(weatherMain, temp);

  return (
    <div className="mt-4 backdrop-blur-xl bg-white/10 rounded-2xl p-4 
                  border border-white/20 flex items-start gap-3">
      <LightBulbIcon className="w-6 h-6 text-yellow-300 flex-shrink-0 mt-0.5" />
      <p className="text-white/90 font-light">{advice}</p>
    </div>
  );
}