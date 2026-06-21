import crypto from 'crypto';

export function createCarbonCacheKey(input: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
