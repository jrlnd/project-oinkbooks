import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// .env lives at the monorepo root; api scripts run from apps/api.
config({ path: '../../.env' });

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
