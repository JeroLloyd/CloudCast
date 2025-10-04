'use client';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

export default function WeatherAlerts({ alerts }: { alerts: any[] }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="mt-3 backdrop-blur-xl bg-red-500/20 border-2 border-red-400/40 rounded-2xl p-3 animate-pulse">
      <div className="flex items-start gap-2">
        <ExclamationTriangleIcon className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-red-400 font-semibold mb-1 text-sm">⚠️ Weather Alert</h3>
          {alerts.map((alert, i) => (
            <div key={i} className="mb-2 last:mb-0">
              <p className="text-white text-xs font-medium">{alert.event}</p>
              <p className="text-white/80 text-xs mt-0.5 leading-relaxed">
                {alert.description?.substring(0, 100)}...
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
