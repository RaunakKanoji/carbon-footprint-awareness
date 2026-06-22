export function requireDatabaseUrl() {
  const databaseUrl =
    process.env.DATABASE_URL ||
    process.env.CARBON_POSTGRES_URL ||
    process.env.CARBON_DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'Missing database URL. Set DATABASE_URL or CARBON_POSTGRES_URL in Vercel.',
    );
  }

  if (databaseUrl.startsWith('prisma://') || databaseUrl.startsWith('prisma+postgres://')) {
    throw new Error(
      'Invalid database URL for pg adapter. Use CARBON_POSTGRES_URL or a postgresql:// connection string, not CARBON_PRISMA_DATABASE_URL.',
    );
  }

  return databaseUrl;
}