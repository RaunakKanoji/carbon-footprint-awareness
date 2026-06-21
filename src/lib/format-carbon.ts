export function formatCo2eKg(value: number, precision = 2) {
  if (!Number.isFinite(value)) return '0.00';

  const minimumVisibleValue = 1 / 10 ** precision;

  if (value > 0 && value < minimumVisibleValue) {
    return `<${minimumVisibleValue.toFixed(precision)}`;
  }

  return value.toFixed(precision);
}
