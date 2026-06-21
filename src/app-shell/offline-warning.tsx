'use client';

import { WifiOff } from 'lucide-react';

import React, { useEffect, useState } from 'react';

export default function OfflineWarning() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Check initial online status in next tick to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setIsOffline(!navigator.onLine);
    }, 0);

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      className="bg-amber-500/10 border-b border-amber-500/20 text-amber-800 dark:text-amber-300 px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 animate-slide-in shrink-0"
      role="alert"
      aria-live="assertive"
    >
      <WifiOff className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
      <span>
        You are currently offline. Action submissions are disabled until connection is restored.
      </span>
    </div>
  );
}
