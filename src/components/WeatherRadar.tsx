'use client';
import { useState } from 'react';
import { MapIcon, MagnifyingGlassPlusIcon, MagnifyingGlassMinusIcon } from '@heroicons/react/24/outline';

export default function WeatherRadar({ 
  lat, 
  lon, 
  cityName 
}: { 
  lat: number, 
  lon: number, 
  cityName: string 
}) {
  const [layer, setLayer] = useState('radar');
  const [zoom, setZoom] = useState(8);

  const layers = [
    { value: 'radar', label: 'Radar', icon: '🌧️', desc: 'Live precipitation' },
    { value: 'wind', label: 'Wind', icon: '🌬️', desc: 'Wind speed & direction' },
    { value: 'temp', label: 'Temp', icon: '🌡️', desc: 'Temperature map' },
    { value: 'clouds', label: 'Clouds', icon: '☁️', desc: 'Cloud coverage' },
    { value: 'rain', label: 'Rain', icon: '💧', desc: 'Rain accumulation' },
    { value: 'thunder', label: 'Lightning', icon: '⚡', desc: 'Thunderstorms' },
  ];

  const getWindyUrl = () => {
    return `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&width=650&height=500&zoom=${zoom}&level=surface&overlay=${layer}&product=ecmwf&menu=&message=true&marker=true&calendar=now&pressure=&type=map&location=coordinates&detail=true&metricWind=km/h&metricTemp=%C2%B0C&radarRange=-1`;
  };

  const currentLayer = layers.find(l => l.value === layer);

  return (
    <div className="backdrop-blur-xl bg-white/10 rounded-2xl p-3 border border-white/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-white font-light text-sm flex items-center gap-2">
            <MapIcon className="w-5 h-5" />
            Weather Radar
          </h3>
          <p className="text-white/50 text-xs mt-0.5">{currentLayer?.desc}</p>
        </div>
        
        {/* Zoom Controls */}
        <div className="flex gap-1">
          <button
            onClick={() => setZoom(Math.max(5, zoom - 1))}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
            title="Zoom Out"
          >
            <MagnifyingGlassMinusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(Math.min(12, zoom + 1))}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-all"
            title="Zoom In"
          >
            <MagnifyingGlassPlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Layer Selector - Scrollable on Mobile */}
      <div className="flex gap-2 mb-2 overflow-x-auto pb-2 custom-scrollbar">
        {layers.map((l) => (
          <button
            key={l.value}
            onClick={() => setLayer(l.value)}
            className={`flex-shrink-0 px-3 py-2 rounded-xl text-xs transition-all ${
              layer === l.value 
                ? 'bg-blue-500/40 text-white border border-blue-400/50 shadow-lg' 
                : 'bg-white/10 text-white/70 hover:bg-white/20 border border-white/20'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-base">{l.icon}</span>
              <span className="font-light">{l.label}</span>
            </div>
          </button>
        ))}
      </div>

      {/* Windy Map */}
      <div className="relative rounded-xl overflow-hidden border border-white/20 bg-black/20">
        <iframe
          key={`${layer}-${zoom}`}
          src={getWindyUrl()}
          className="w-full h-64 sm:h-72 md:h-80"
          frameBorder="0"
          loading="lazy"
          allowFullScreen
        />

        {/* City Label */}
        <div className="absolute top-3 left-3 backdrop-blur-lg bg-black/60 px-3 py-2 rounded-xl z-10 pointer-events-none">
          <p className="text-white text-xs font-light flex items-center gap-1.5">
            <span>📍</span>
            <span className="font-medium">{cityName}</span>
          </p>
        </div>

        {/* Current Layer Badge */}
        <div className="absolute top-3 right-3 backdrop-blur-lg bg-blue-500/30 px-3 py-1.5 rounded-xl z-10 pointer-events-none border border-blue-400/30">
          <p className="text-white text-xs font-medium flex items-center gap-1">
            {currentLayer?.icon} {currentLayer?.label}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <p className="text-white/50 text-xs">Powered by Windy.com</p>
        <a
          href={`https://www.windy.com/${lat}/${lon}?${layer},${lat},${lon},${zoom}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-300 text-xs hover:text-blue-200 transition-colors flex items-center gap-1"
        >
          <span>Full Screen</span>
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}
