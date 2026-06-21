'use client';

import { AlertTriangle, RefreshCw } from 'lucide-react';

import React, { useEffect } from 'react';

import { Button } from '@/src/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/src/components/ui/card';
import { logger } from '@/src/lib/logger';

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
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader className="flex flex-col items-center text-center pb-2">
          <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-3 text-red-600">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <CardTitle className="text-xl font-bold text-text-primary">
            Something went wrong
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-text-secondary leading-relaxed mb-4">
            An unexpected error occurred while loading this page. Our team has been notified.
          </p>
          {error.digest && (
            <p className="rounded-xl bg-bg-elevated p-3 text-xs text-text-muted">
              Reference: {error.digest}
            </p>
          )}
        </CardContent>
        <CardFooter className="flex justify-center pt-2">
          <Button
            onClick={() => reset()}
            className="flex cursor-pointer items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            <span>Try Again</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
