const compactNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 });
const wholeNumber = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

export function formatKgCo2e(value: number) {
  if (!Number.isFinite(value)) return '0 kg CO₂e';
  const digits = Math.abs(value) < 10 ? 1 : 0;
  return `${value.toFixed(digits)} kg CO₂e`;
}

export function formatKgSaved(value: number) {
  if (!Number.isFinite(value)) return '0 kg saved';
  const digits = Math.abs(value) < 10 ? 1 : 0;
  return `${value.toFixed(digits)} kg saved`;
}

export function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${compactNumber.format(value)}%`;
}

export function formatXp(value: number) {
  return `${wholeNumber.format(Number.isFinite(value) ? value : 0)} XP`;
}

export function formatDate(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatRelativeTime(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const days = Math.round((date.getTime() - Date.now()) / 86_400_000);
  if (days === 0) return 'Today';
  if (days === -1) return 'Yesterday';
  if (days === 1) return 'Tomorrow';
  if (Math.abs(days) < 7) return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(days, 'day');
  return formatDate(date);
}

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

