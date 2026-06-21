'use client';

import { Camera, CameraOff, Loader2, ScanBarcode } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/src/components/ui/button';

export default function BarcodeScanner({
  onBarcode,
  isLoading,
}: {
  onBarcode: (barcode: string) => void;
  isLoading?: boolean;
}) {
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scannerInstance, setScannerInstance] = useState<{ stop: () => Promise<void> } | null>(null);

  // Clean up scanner on unmount
  useEffect(() => {
    return () => {
      if (scannerInstance) {
        scannerInstance.stop().catch((err: unknown) => {
          console.error('Failed to stop scanner on unmount', err);
        });
      }
    };
  }, [scannerInstance]);

  const startCameraScanner = async () => {
    try {
      setCameraError(null);
      setShowCamera(true);

      setTimeout(async () => {
        try {
          const { Html5Qrcode } = await import('html5-qrcode');
          const html5QrCode = new Html5Qrcode('product-barcode-scanner-viewport');
          setScannerInstance(html5QrCode);

          const config = {
            fps: 10,
            qrbox: (width: number, height: number) => {
              const w = Math.min(width * 0.8, 320);
              const h = Math.min(height * 0.4, 160);
              return { width: w, height: h };
            },
            aspectRatio: 1.0,
          };

          await html5QrCode.start(
            { facingMode: 'environment' },
            config,
            (decodedText) => {
              html5QrCode
                .stop()
                .then(() => {
                  setShowCamera(false);
                  setScannerInstance(null);
                  onBarcode(decodedText);
                })
                .catch((err) => {
                  console.error('Failed to stop scanner after success', err);
                  setShowCamera(false);
                  setScannerInstance(null);
                  onBarcode(decodedText);
                });
            },
            () => {},
          );
        } catch (err: unknown) {
          console.error('Error inside scanner initialization timeout:', err);
          setCameraError(err instanceof Error ? err.message : 'Failed to start camera scanner.');
          setShowCamera(false);
        }
      }, 300);
    } catch (err: unknown) {
      console.error('Error starting camera scanner:', err);
      setCameraError(err instanceof Error ? err.message : 'Failed to access camera.');
      setShowCamera(false);
    }
  };

  const stopCameraScanner = async () => {
    if (scannerInstance) {
      try {
        await scannerInstance.stop();
      } catch (err) {
        console.error('Failed to stop camera scanner on click', err);
      }
      setScannerInstance(null);
    }
    setShowCamera(false);
  };

  return (
    <div className="flex flex-col gap-4">
      {!showCamera ? (
        <Button
          type="button"
          onClick={startCameraScanner}
          disabled={isLoading}
          className="h-10 shrink-0 !gap-0 px-4"
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Camera className="mr-2 h-4 w-4" />
          )}
          Scan barcode
        </Button>
      ) : (
        <Button
          type="button"
          onClick={stopCameraScanner}
          variant="destructive"
          className="h-10 shrink-0 !gap-0 px-4"
        >
          <CameraOff className="mr-2 h-4 w-4" />
          Stop scanner
        </Button>
      )}

      {showCamera && (
        <div className="relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface p-4 transition-all ring-2 ring-indigo-500/10">
          <div
            id="product-barcode-scanner-viewport"
            className="relative aspect-video w-full overflow-hidden rounded-xl bg-black border border-border-subtle"
          />
          <div className="mt-1 flex items-center gap-1.5 text-xs text-text-secondary">
            <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span>Scanning active... Please align your product barcode.</span>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="flex justify-between items-center rounded-xl bg-status-error/10 p-3 text-xs font-semibold text-status-error">
          <span>{cameraError}</span>
          <button
            type="button"
            onClick={() => setCameraError(null)}
            className="ml-2 text-xs font-bold underline hover:text-status-error/80"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="rounded-2xl border border-border-subtle bg-bg-surface p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
            <ScanBarcode className="h-4 w-4" />
          </div>

          <div>
            <p className="text-sm font-black text-text-primary">Camera scan</p>
            <p className="mt-1 text-xs leading-5 text-text-secondary">
              Use this when the product barcode is visible on packaging.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}