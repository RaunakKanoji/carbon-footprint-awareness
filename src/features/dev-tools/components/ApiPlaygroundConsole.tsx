'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

import { buttonVariants } from '@/src/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card';

export type PlaygroundStatus = 'configured' | 'missing' | 'optional' | 'disabled' | 'not-required' | 'available' | 'enabled';

export type StatusRow = {
  label: string;
  status: PlaygroundStatus;
  detail?: string;
};

export type HistoryItem = {
  timestamp: string;
  provider: string;
  endpoint: string;
  status: 'Success' | 'Failed';
  result?: string;
  fromCache?: boolean;
};

const statusLabel: Record<PlaygroundStatus, string> = {
  configured: 'Configured',
  missing: 'Missing',
  optional: 'Optional',
  disabled: 'Disabled',
  'not-required': 'Not required',
  available: 'Available',
  enabled: 'Enabled',
};

const statusClasses: Record<PlaygroundStatus, string> = {
  configured: 'border-accent-primary/25 bg-accent-primary/10 text-accent-primary',
  enabled: 'border-accent-primary/25 bg-accent-primary/10 text-accent-primary',
  available: 'border-accent-primary/25 bg-accent-primary/10 text-accent-primary',
  missing: 'border-state-error/25 bg-state-error/10 text-state-error',
  disabled: 'border-state-error/25 bg-state-error/10 text-state-error',
  optional: 'border-border-default bg-bg-base text-text-secondary',
  'not-required': 'border-border-default bg-bg-base text-text-secondary',
};

export function ApiBadge({
  children,
  status = 'optional',
}: {
  children: ReactNode;
  status?: PlaygroundStatus;
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${statusClasses[status]}`}>
      {children}
    </span>
  );
}

export function ApiPlaygroundShell({
  title,
  description,
  providerType,
  status,
  badges,
  children,
}: {
  title: string;
  description: string;
  providerType: string;
  status: PlaygroundStatus;
  badges: readonly string[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 p-4 sm:p-6">
      <section className="border-b border-border-default pb-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">API Testing & Understanding Console</p>
            <h1 className="mt-1 text-2xl font-bold text-text-primary sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">{description}</p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <ApiBadge status={status}>{statusLabel[status]}</ApiBadge>
            <ApiBadge status="optional">{providerType}</ApiBadge>
            {badges.map((badge) => (
              <ApiBadge key={badge} status="optional">
                {badge}
              </ApiBadge>
            ))}
          </div>
        </div>
      </section>
      {children}
    </div>
  );
}

export function ApiOverviewGrid({
  purpose,
  config,
  flow,
}: {
  purpose: ReactNode;
  config: ReactNode;
  flow: ReactNode;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <div className="grid gap-4">{purpose}{flow}</div>
      <div>{config}</div>
    </div>
  );
}

export function ApiPurposeCard({
  title = 'What this API is for',
  items,
  warning,
}: {
  title?: string;
  items: string[];
  warning?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Use this panel to choose the right provider before testing payloads.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="grid gap-2 text-sm text-text-secondary sm:grid-cols-2">
          {items.map((item) => (
            <li key={item} className="rounded-lg border border-border-default bg-bg-base px-3 py-2">
              {item}
            </li>
          ))}
        </ul>
        {warning ? (
          <p className="rounded-lg border border-state-warning/30 bg-bg-base p-3 text-sm font-medium text-text-primary">
            {warning}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ApiStatusCard({
  rows,
  loading,
  error,
  missingHint,
}: {
  rows: StatusRow[];
  loading?: boolean;
  error?: string;
  missingHint?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration status</CardTitle>
        <CardDescription>Secrets and full authorization headers are never displayed.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? <p className="text-sm text-text-secondary">Loading configuration...</p> : null}
        {error ? <p className="rounded-lg border border-state-error/30 bg-bg-base p-3 text-sm font-semibold text-state-error">{error}</p> : null}
        {!loading && !error ? (
          <div className="grid gap-2">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 rounded-lg border border-border-default bg-bg-base px-3 py-2 text-sm">
                <span className="min-w-0 text-text-secondary">{row.label}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {row.detail ? <span className="text-xs text-text-secondary">{row.detail}</span> : null}
                  <ApiBadge status={row.status}>{statusLabel[row.status]}</ApiBadge>
                </span>
              </div>
            ))}
          </div>
        ) : null}
        {missingHint ? (
          <p className="rounded-lg border border-state-error/30 bg-bg-base p-3 text-sm font-medium text-state-error">
            {missingHint}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ApiAppFlowCard({ steps }: { steps: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How this connects to Carbon Compass AI</CardTitle>
        <CardDescription>The playground mirrors the app path from input to stored carbon data.</CardDescription>
      </CardHeader>
      <CardContent>
        <ol className="grid gap-2 text-sm text-text-secondary">
          {steps.map((step, index) => (
            <li key={step} className="flex gap-3 rounded-lg border border-border-default bg-bg-base px-3 py-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-primary/10 text-xs font-bold text-accent-primary">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}

export function EndpointExplanationCard({
  title,
  what,
  appUse,
  required,
  optional,
  normalized,
  errors,
}: {
  title: string;
  what: string;
  appUse: string;
  required: string[];
  optional?: string[];
  normalized: string[];
  errors: string[];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{what}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm text-text-secondary md:grid-cols-2">
        <div className="rounded-lg border border-border-default bg-bg-base p-3">
          <p className="font-semibold text-text-primary">When the app uses it</p>
          <p className="mt-1">{appUse}</p>
        </div>
        <MiniList title="Required inputs" items={required} />
        <MiniList title="Optional inputs" items={optional ?? ['None']} />
        <MiniList title="Normalized output" items={normalized} />
        <MiniList title="Common errors" items={errors} />
      </CardContent>
    </Card>
  );
}

function MiniList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-border-default bg-bg-base p-3">
      <p className="font-semibold text-text-primary">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-4">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function RequestPreviewCard({
  internalRoute,
  externalEndpoint,
  method,
  payload,
  auth,
}: {
  internalRoute: string;
  externalEndpoint: string;
  method?: string;
  payload?: unknown;
  auth?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Request preview</CardTitle>
        <CardDescription>Shows what will be called without revealing secrets.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <PreviewRow label="Internal route" value={`${method ?? 'POST'} ${internalRoute}`} />
        <PreviewRow label="Provider endpoint" value={externalEndpoint} />
        {auth ? <PreviewRow label="Authorization" value={auth} /> : null}
        {payload !== undefined ? (
          <pre className="max-h-52 overflow-auto rounded-lg border border-border-default bg-bg-base p-3 text-xs text-text-primary">
            {typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2)}
          </pre>
        ) : null}
      </CardContent>
    </Card>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border-default bg-bg-base px-3 py-2">
      <span className="text-text-secondary">{label}</span>
      <span className="text-right font-medium text-text-primary">{value}</span>
    </div>
  );
}

export function NormalizedOutputCard({ value }: { value: unknown }) {
  const formatted = value === null || value === undefined ? '' : JSON.stringify(value, null, 2);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Normalized output</CardTitle>
        <CardDescription>The app-facing fields extracted from the provider response.</CardDescription>
      </CardHeader>
      <CardContent>
        <pre className="max-h-64 overflow-auto rounded-lg border border-border-default bg-bg-base p-3 text-xs leading-relaxed text-text-primary">
          {formatted || 'Run a test to see normalized output before the raw response.'}
        </pre>
      </CardContent>
    </Card>
  );
}

export function ApiErrorPanel({
  title,
  provider,
  endpoint,
  message,
  status,
  fixes,
  raw,
}: {
  title?: string;
  provider: string;
  endpoint?: string;
  message?: string;
  status?: string | number;
  fixes: string[];
  raw?: unknown;
}) {
  if (!message && !raw) return null;

  return (
    <Card className="border-state-error/30">
      <CardHeader>
        <CardTitle>{title ?? 'Request failed'}</CardTitle>
        <CardDescription>
          {provider}{endpoint ? ` · ${endpoint}` : ''}{status ? ` · HTTP ${status}` : ''}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {message ? <p className="text-sm font-medium text-state-error">{message}</p> : null}
        <MiniList title="Possible fixes" items={fixes} />
        {raw !== undefined ? (
          <pre className="max-h-56 overflow-auto rounded-lg border border-border-default bg-bg-base p-3 text-xs text-text-primary">
            {JSON.stringify(raw, null, 2)}
          </pre>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function ApiTestHistoryPanel({ items }: { items: HistoryItem[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent test history</CardTitle>
        <CardDescription>Stored locally in this playground session.</CardDescription>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <p className="text-sm text-text-secondary">Run a test to see recent provider calls here.</p>
        ) : (
          <div className="divide-y divide-border-default rounded-lg border border-border-default">
            {items.slice(0, 6).map((item, index) => (
              <div key={`${item.timestamp}-${index}`} className="grid gap-1 p-3 text-sm sm:grid-cols-[1fr_auto]">
                <p className="font-medium text-text-primary">
                  {item.timestamp} · {item.provider} · {item.endpoint}
                </p>
                <ApiBadge status={item.status === 'Success' ? 'configured' : 'missing'}>{item.status}</ApiBadge>
                <p className="text-text-secondary sm:col-span-2">
                  {item.result ?? 'No normalized result'} · Cache: {item.fromCache ? 'Yes' : 'No'}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DocsHintCard({ children }: { children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Developer notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-text-secondary">{children}</CardContent>
    </Card>
  );
}

export function PlaygroundIndexCard({
  title,
  href,
  purpose,
  feature,
  status,
  badges,
}: {
  title: string;
  href: string;
  purpose: string;
  feature: string;
  status: PlaygroundStatus;
  badges: readonly string[];
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{purpose}</CardDescription>
          </div>
          <ApiBadge status={status}>{statusLabel[status]}</ApiBadge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-text-secondary">{feature}</p>
        <div className="flex flex-wrap gap-2">
          {badges.map((badge) => (
            <ApiBadge key={badge}>{badge}</ApiBadge>
          ))}
        </div>
        <Link className={buttonVariants({ variant: 'outline' })} href={href}>
          Open playground
        </Link>
      </CardContent>
    </Card>
  );
}
