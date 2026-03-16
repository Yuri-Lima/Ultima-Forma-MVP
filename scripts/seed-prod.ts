/**
 * Production-safe bootstrap seed.
 * Only creates system-level data that must exist for the platform to operate.
 * Idempotent: uses ON CONFLICT DO NOTHING.
 * Does NOT use fixed IDs or test data.
 */
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { tenants } from '../libs/infrastructure/drizzle/src/lib/schema';

config();

async function seedProd() {
  const connectionString = process.env['DATABASE_URL'];
  if (!connectionString) {
    console.error('DATABASE_URL is required for production seed');
    process.exit(1);
  }

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  console.log('[seed-prod] Starting production bootstrap seed...');

  const [defaultTenant] = await db
    .insert(tenants)
    .values({ name: 'Default Tenant' })
    .onConflictDoNothing()
    .returning();

  if (defaultTenant) {
    console.log('[seed-prod] Created default tenant:', defaultTenant.id);
  } else {
    console.log('[seed-prod] Default tenant already exists, skipping');
  }

  await pool.end();
  console.log('[seed-prod] Production seed complete');
}

seedProd().catch((err) => {
  console.error('[seed-prod] Failed:', err);
  process.exit(1);
});
