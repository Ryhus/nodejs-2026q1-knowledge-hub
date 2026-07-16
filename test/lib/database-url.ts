import 'dotenv/config';

export function getTestDatabaseUrl(): string {
  const configuredUrl =
    process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;

  if (!configuredUrl) {
    throw new Error('DATABASE_URL or TEST_DATABASE_URL must be configured');
  }

  const databaseUrl = new URL(configuredUrl);

  if (!process.env.TEST_DATABASE_URL && databaseUrl.hostname === 'db') {
    databaseUrl.hostname = 'localhost';
    databaseUrl.port = '5433';
  }

  return databaseUrl.toString();
}
