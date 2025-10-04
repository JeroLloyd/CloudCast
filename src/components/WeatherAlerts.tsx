'use client';
import { ExclamationTriangleIcon, MegaphoneIcon } from '@heroicons/react/24/solid';

const SEVERITY_COLORS = {
  extreme: { bg: 'bg-red-500/30', border: 'border-red-400/50', text: 'text-red-400' },
  severe: { bg: 'bg-orange-500/30', border: 'border-orange-400/50', text: 'text-orange-400' },
  moderate: { bg: 'bg-yellow-500/30', border: 'border-yellow-400/50', text: 'text-yellow-400' },
  minor: { bg: 'bg-blue-500/30', border: 'border-blue-400/50', text: 'text-blue-400' },
};

export default function WeatherAlerts({ alerts }: { alerts: any[] }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert, i) => {
        const severity = alert.severity || 'moderate';
        const colors = SEVERITY_COLORS[severity] || SEVERITY_COLORS.moderate;

        return (
          <div 
            key={i} 
            className={`backdrop-blur-2xl ${colors.bg} border-2 ${colors.border} rounded-2xl p-3 animate-pulse`}
          >
            <div className="flex items-start gap-2">
              {severity === 'extreme' ? (
                <MegaphoneIcon className={`w-6 h-6 ${colors.text} flex-shrink-0 animate-bounce`} />
              ) : (
                <ExclamationTriangleIcon className={`w-6 h-6 ${colors.text} flex-shrink-0`} />
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className={`${colors.text} font-bold text-sm uppercase`}>
                    {alert.event}
                  </h3>
                  <span className={`${colors.text} text-xs font-medium px-2 py-0.5 rounded-full ${colors.bg}`}>
                    {severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-white text-xs leading-relaxed mb-1">
                  {alert.description?.substring(0, 150)}...
                </p>
                <div className="flex items-center gap-3 text-white/60 text-xs">
                  <span>🕐 {new Date(alert.start * 1000).toLocaleString()}</span>
                  <span>→ {new Date(alert.end * 1000).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
