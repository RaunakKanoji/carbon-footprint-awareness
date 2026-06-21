'use client';

import { useState } from 'react';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';

export default function JsonResponseViewer({
  value,
  onClear,
}: {
  value: unknown;
  onClear?: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [query, setQuery] = useState('');
  const formatted = value === null || value === undefined ? '' : JSON.stringify(value, null, 2);
  const size = formatted ? new Blob([formatted]).size : 0;
  const display =
    formatted && query.trim()
      ? formatted
          .split('\n')
          .filter((line) => line.toLowerCase().includes(query.trim().toLowerCase()))
          .join('\n')
      : formatted;

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">Raw response</span>
          <span>{formatted ? `${size.toLocaleString()} bytes` : 'No response yet'}</span>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search JSON"
            className="h-8 w-full sm:w-40"
            disabled={!formatted}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!formatted}
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!formatted}
            onClick={() => navigator.clipboard.writeText(formatted)}
          >
            Copy response
          </Button>
          <Button type="button" variant="outline" size="sm" disabled={!formatted} onClick={onClear}>
            Clear response
          </Button>
        </div>
      </div>
      <pre className={`${expanded ? 'max-h-[760px]' : 'max-h-[260px]'} overflow-auto rounded-xl border border-border-default bg-bg-base p-3 text-xs leading-relaxed text-text-primary`}>
        {display || 'No response yet. Run a test to see provider JSON here.'}
      </pre>
    </div>
  );
}
