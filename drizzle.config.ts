import { defineConfig } from 'drizzle-kit';

// drizzle-kit doesn't read .env by itself — load it so `npm run db:push` uses the real DATABASE_URL.
try {
  process.loadEnvFile('.env');
} catch {
  // no .env file (e.g. CI) — rely on real environment variables
}

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://placeholder-url',
  },
  tablesFilter: ['!pg_stat_monitor*', '!pg_stat_statements*'],
});
