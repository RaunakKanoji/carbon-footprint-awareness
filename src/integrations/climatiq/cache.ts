import crypto from 'crypto';

export function createClimatiqCacheKey(input: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
