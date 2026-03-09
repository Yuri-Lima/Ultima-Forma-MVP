import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './libs/infrastructure/drizzle/src/lib/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/ultima_forma',
  },
});
