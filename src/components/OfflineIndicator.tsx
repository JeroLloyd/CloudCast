'use client';
import { useEffect, useState } from 'react';
import { WifiIcon, SignalSlashIcon } from '@heroicons/react/24/outline';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 backdrop-blur-2xl bg-orange-500/20 border border-orange-400/40 rounded-full px-4 py-2 z-50 animate-pulse">
      <div className="flex items-center gap-2">
        <SignalSlashIcon className="w-5 h-5 text-orange-400" />
        <p className="text-white text-sm font-light">Offline - Showing cached data</p>
      </div>
    </div>
  );
}
