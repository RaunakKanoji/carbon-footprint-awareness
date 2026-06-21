'use client';

import { Barcode, CheckCircle2, Clock, PackageSearch, Trash2, XCircle } from 'lucide-react';

import { Button } from '@/src/components/ui/button';

export type ProductScanHistoryItem = {
  id: string;
  productName?: string | null;
  brand?: string | null;
  barcode: string;
  carbonEstimated: boolean;
  createdAt: string;
};

function formatDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split('-');

  if (!year || !month || !day) return value.slice(0, 10);

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  return `${day} ${monthNames[Number(month) - 1] ?? month} ${year}`;
}

export default function ProductScanHistory({
  scans,
  onDelete,
}: {
  scans: ProductScanHistoryItem[];
  onDelete?: (id: string) => void;
}) {
  return (
    <aside className="flex h-full min-h-[380px] flex-col overflow-hidden rounded-3xl border border-border-default bg-bg-surface shadow-sm">
      <div className="border-b border-border-subtle p-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
            <Clock className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-text-muted">
              Scan History
            </p>

            <h2 className="text-xl font-black tracking-tight text-text-primary">
              Recent scanned products
            </h2>
          </div>
        </div>

        <p className="mt-3 text-sm leading-6 text-text-secondary">
          Products you recently searched or estimated.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {scans.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 py-12 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <PackageSearch className="h-7 w-7" />
            </div>

            <h3 className="mt-4 text-lg font-black text-text-primary">No product scans yet</h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
              Scan or search a barcode and your recent products will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border-subtle">
            {scans.map((scan) => (
              <div key={scan.id} className="group flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-bg-elevated text-text-secondary ring-1 ring-border-default">
                      <Barcode className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-black text-text-primary">
                        {scan.productName || scan.barcode}
                      </p>

                      <p className="mt-1 truncate text-xs font-semibold text-text-secondary">
                        {scan.brand || 'Unknown brand'} · {scan.barcode}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-black ring-1 ${scan.carbonEstimated
                              ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
                              : 'bg-slate-50 text-slate-600 ring-slate-100'
                            }`}
                        >
                          {scan.carbonEstimated ? (
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5" />
                          )}
                          {scan.carbonEstimated ? 'Estimated' : 'Not estimated'}
                        </span>

                        <span className="text-xs font-semibold text-text-muted">
                          {formatDate(scan.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {onDelete && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 rounded-full opacity-80 transition-opacity hover:opacity-100"
                    onClick={() => onDelete(scan.id)}
                    aria-label={`Delete scan for ${scan.productName || scan.barcode}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}