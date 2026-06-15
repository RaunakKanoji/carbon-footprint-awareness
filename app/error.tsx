'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

import React, { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error using the custom logger helper
    logger.error('Client-side uncaught application crash:', error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-bg-base">
      <Card className="w-full max-w-md border-border-default/60 shadow-xl animate-scale-in">
        <CardHeader className="flex flex-col items-center text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold text-text-primary">
            Something went wrong!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            An unexpected error occurred while loading this page. Our team has been notified.
          </p>
          <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-left">
            <p className="break-words text-xs font-semibold text-red-800 dark:text-red-300">
              {error.message || 'Unknown application error'}
            </p>
            {error.digest && (
              <p className="mt-1 break-all text-xs text-text-muted tabular-nums">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Button
            onClick={() => reset()}
            className="flex cursor-pointer items-center gap-2 rounded-xl bg-emerald-600 px-6 py-2.5 font-bold text-white shadow-sm transition-colors hover:bg-emerald-700"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Try Again</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
