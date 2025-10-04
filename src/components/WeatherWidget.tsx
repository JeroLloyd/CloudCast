'use client';
import { useState } from 'react';
import { DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function WeatherWidget({ weather, unit }: { weather: any, unit: string }) {
  const [copied, setCopied] = useState(false);

  const temp = unit === 'C' 
    ? Math.round(weather.main.temp - 273.15) 
    : Math.round((weather.main.temp - 273.15) * 9/5 + 32);

  const widgetCode = `
<!-- CloudCast Weather Widget -->
<div style="font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 16px; padding: 20px; color: white; max-width: 300px;">
  <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 300;">${weather.name}</h2>
  <div style="display: flex; align-items: center; justify-content: space-between;">
    <div>
      <div style="font-size: 48px; font-weight: 200;">${temp}°${unit}</div>
      <div style="opacity: 0.8; font-size: 14px;">${weather.weather[0].description}</div>
    </div>
    <div style="font-size: 64px;">☁️</div>
  </div>
  <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 12px; opacity: 0.7;">
    Powered by CloudCast
  </div>
</div>
`.trim();

  const copyWidget = () => {
    navigator.clipboard.writeText(widgetCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="backdrop-blur-2xl bg-white/18 rounded-2xl p-3 border border-white/30">
      <h3 className="text-white font-light text-sm mb-2">📱 Share Widget</h3>

      {/* Widget Preview */}
      <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl p-4 mb-3">
        <h2 className="text-white text-xl font-light mb-2">{weather.name}</h2>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-white text-4xl font-thin">{temp}°{unit}</div>
            <div className="text-white/80 text-xs capitalize">{weather.weather[0].description}</div>
          </div>
          <div className="text-5xl">☁️</div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/20 text-white/60 text-xs">
          Powered by CloudCast
        </div>
      </div>

      {/* Copy Button */}
      <button
        onClick={copyWidget}
        className="w-full py-2 px-3 rounded-lg bg-blue-500/30 hover:bg-blue-500/50 text-white text-sm flex items-center justify-center gap-2 transition-all"
      >
        {copied ? (
          <>
            <CheckIcon className="w-4 h-4" />
            Copied!
          </>
        ) : (
          <>
            <DocumentDuplicateIcon className="w-4 h-4" />
            Copy Widget Code
          </>
        )}
      </button>
    </div>
  );
}
