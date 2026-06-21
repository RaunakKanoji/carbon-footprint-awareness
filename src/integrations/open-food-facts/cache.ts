import crypto from 'crypto';

export function createOpenFoodFactsCacheKey(input: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}

export function getCacheExpiryDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}
