'use client';

import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

import React, { createContext, useCallback, useContext, useState } from 'react';

import { cn } from '@/src/lib/utils';

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

          let bgClass = 'bg-bg-surface border-border-default text-text-primary';
          if (isDestructive) {
            bgClass = 'bg-bg-surface border-red-200 text-text-primary';
          } else if (isSuccess) {
            bgClass = 'bg-bg-surface border-emerald-200 text-text-primary';
          } else if (isWarning) {
            bgClass = 'bg-bg-surface border-amber-200 text-text-primary';
          } else if (isInfo) {
            bgClass = 'bg-bg-surface border-blue-200 text-text-primary';
          }

          return (
            <div
              key={t.id}
              role={isDestructive ? 'alert' : 'status'}
              aria-live={isDestructive ? 'assertive' : 'polite'}
              className={cn(
                'pointer-events-auto flex w-full items-start gap-3 rounded-2xl border p-4 shadow-md transition-[background-color,border-color,box-shadow,opacity,transform] duration-200 animate-slide-in',
                bgClass,
              )}
            >
              {isDestructive && (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )}
              {isSuccess && (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
              )}
              {isWarning && (
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              )}
              {isInfo && (
                <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
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
