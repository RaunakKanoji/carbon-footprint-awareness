import 'server-only';

export const env = {
  databaseUrl: process.env.DATABASE_URL,
  enableDevTools:
    process.env.ENABLE_DEV_API_PLAYGROUND === 'true' ||
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === 'true',
} as const;

export function requireDatabaseUrl(): string {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is not defined');
  }

  return env.databaseUrl;
}
