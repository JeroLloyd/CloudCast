'use client';

const AQI_LEVELS: Record<number, { label: string; color: string; text: string; bg: string }> = {
  1: { label: 'Good', color: 'text-green-400', text: 'Air quality is excellent', bg: 'bg-green-500/20' },
  2: { label: 'Fair', color: 'text-yellow-400', text: 'Air quality is acceptable', bg: 'bg-yellow-500/20' },
  3: { label: 'Moderate', color: 'text-orange-400', text: 'May affect sensitive groups', bg: 'bg-orange-500/20' },
  4: { label: 'Poor', color: 'text-red-400', text: 'Unhealthy for everyone', bg: 'bg-red-500/20' },
  5: { label: 'Very Poor', color: 'text-purple-400', text: 'Health alert: avoid outdoor activity', bg: 'bg-purple-500/20' },
};

export default function AirQuality({ aqi }: { aqi: number }) {
  const level = AQI_LEVELS[aqi] || AQI_LEVELS[1];

  return (
    <div className={`mt-3 backdrop-blur-xl ${level.bg} rounded-2xl p-3 border border-white/20 animate-fade-in`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/60 text-xs font-light">Air Quality</p>
          <p className={`${level.color} text-base font-light mt-0.5`}>{level.label}</p>
          <p className="text-white/70 text-xs mt-0.5">{level.text}</p>
        </div>
        <div className={`w-12 h-12 ${level.bg} border-2 ${level.color.replace('text-', 'border-')} rounded-full flex items-center justify-center`}>
          <span className={`${level.color} text-xl font-bold`}>{aqi}</span>
        </div>
      </div>
    </div>
  );
}
