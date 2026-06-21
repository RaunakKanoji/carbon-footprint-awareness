import crypto from 'crypto';

export function createCarbonInterfaceCacheKey(input: unknown) {
  return crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
}
