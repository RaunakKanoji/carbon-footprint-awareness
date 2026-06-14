'use client';

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

import React, { createContext, useCallback, useContext, useState } from 'react';

import { cn } from '@/lib/utils';

export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning' | 'info';

export interface Toast {
  id: string;
  title?: string;
  description: string;
  variant?: ToastVariant;
  duration?: number;
}

export type ToastOptions = Omit<Toast, 'id'>;

interface ToastContextType {
  toast: (options: ToastOptions) => void;
  dismiss: (id: string) => void;
  toasts: Toast[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 5000 }: ToastOptions) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = { id, title, description, variant, duration };

      setToasts((prev) => {
        // Limit maximum number of visible toasts to 5 to avoid cluttering screen
        const list = [...prev, newToast];
        if (list.length > 5) {
          return list.slice(list.length - 5);
        }
        return list;
      });

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss, toasts }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 w-full max-w-[360px] sm:max-w-[400px] pointer-events-none"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const isDestructive = t.variant === 'destructive';
          const isSuccess = t.variant === 'success';
          const isWarning = t.variant === 'warning';
          const isInfo = t.variant === 'info' || t.variant === 'default' || !t.variant;

          let bgClass =
            'bg-bg-surface border-border-default/60 text-text-primary border-l-4 border-l-blue-500';
          if (isDestructive) {
            bgClass =
              'bg-[#fff5f5] dark:bg-[#1f1212] border-red-500/20 text-red-900 dark:text-red-200 border-l-4 border-l-red-500';
          } else if (isSuccess) {
            bgClass =
              'bg-[#f0fdf4] dark:bg-[#121c16] border-emerald-500/20 text-emerald-900 dark:text-emerald-200 border-l-4 border-l-emerald-500';
          } else if (isWarning) {
            bgClass =
              'bg-[#fffbeb] dark:bg-[#1c1812] border-amber-500/20 text-amber-900 dark:text-amber-200 border-l-4 border-l-amber-500';
          } else if (isInfo) {
            bgClass =
              'bg-[#eff6ff] dark:bg-[#12171c] border-blue-500/20 text-blue-900 dark:text-blue-200 border-l-4 border-l-blue-500';
          }

          return (
            <div
              key={t.id}
              role={isDestructive ? 'alert' : 'status'}
              aria-live={isDestructive ? 'assertive' : 'polite'}
              className={cn(
                'w-full p-4 rounded-xl border shadow-lg flex items-start gap-3 pointer-events-auto animate-slide-in transition-[background-color,border-color,box-shadow,opacity,transform] duration-300',
                bgClass,
              )}
            >
              {isDestructive && (
                <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              )}
              {isSuccess && (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              )}
              {isWarning && (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              )}
              {isInfo && (
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 min-w-0">
                {t.title && <h5 className="font-bold text-xs leading-none mb-1">{t.title}</h5>}
                <p className="text-xs leading-normal font-medium opacity-90">{t.description}</p>
              </div>

              <button
                onClick={() => dismiss(t.id)}
                className="text-text-muted hover:text-text-primary p-0.5 rounded-lg hover:bg-bg-elevated transition-colors cursor-pointer shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
