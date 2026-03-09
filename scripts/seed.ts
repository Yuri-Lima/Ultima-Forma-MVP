import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  partners,
  tenants,
} from '../libs/infrastructure/drizzle/src/lib/schema';

config();

/** IDs fixos para uso em exemplos de API e testes locais */
export const SEED_TENANT_ID = '21a30170-166d-44e3-ac09-b640768dc1c7';
export const SEED_PARTNER_ID = 'c2989a86-ca61-40f2-9d8a-e6250bde4f9d';

async function seed() {
  const connectionString =
    process.env['DATABASE_URL'] ??
    'postgresql://postgres:postgres@localhost:5432/ultima_forma';
  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  const [tenant] = await db
    .insert(tenants)
    .values({ id: SEED_TENANT_ID, name: 'Ultima Forma Demo' })
    .onConflictDoNothing({ target: [tenants.id] })
    .returning();

  const tenantId = tenant?.id ?? SEED_TENANT_ID;

  const [partner] = await db
    .insert(partners)
    .values({
      id: SEED_PARTNER_ID,
      tenantId,
      name: 'Demo Partner',
    })
    .onConflictDoNothing({ target: [partners.id] })
    .returning();

  const partnerId = partner?.id ?? SEED_PARTNER_ID;

  console.log('Seed completed:');
  console.log('  Tenant ID:', tenantId);
  console.log('  Partner ID:', partnerId);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
