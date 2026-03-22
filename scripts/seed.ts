import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import {
  consumers,
  issuers,
  partners,
  tenants,
} from '../libs/infrastructure/drizzle/src/lib/schema';
import {
  SEED_CONSUMER_ID,
  SEED_ISSUER_ID,
  SEED_PARTNER_ID,
  SEED_TENANT_ID,
  SEED_PARTNER_A_ID,
  SEED_ISSUER_A_ID,
  SEED_PARTNER_B_ID,
  SEED_ISSUER_B_ID,
} from './fixtures';

config();

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

  await db
    .insert(consumers)
    .values({
      id: SEED_CONSUMER_ID,
      partnerId,
      tenantId,
      name: 'Demo Consumer',
      scopes: ['email', 'name'],
    })
    .onConflictDoNothing({ target: [consumers.id] });

  await db
    .insert(issuers)
    .values({
      id: SEED_ISSUER_ID,
      partnerId,
      tenantId,
      name: 'Demo Issuer',
      scopes: ['email', 'name'],
    })
    .onConflictDoNothing({ target: [issuers.id] });

  // Demo issuers for investor simulator
  await db
    .insert(partners)
    .values({
      id: SEED_PARTNER_A_ID,
      tenantId,
      name: 'Banco Digital Alpha',
    })
    .onConflictDoNothing({ target: [partners.id] });

  await db
    .insert(issuers)
    .values({
      id: SEED_ISSUER_A_ID,
      partnerId: SEED_PARTNER_A_ID,
      tenantId,
      name: 'Alpha Credenciais',
      scopes: ['cpf', 'phone', 'email'],
    })
    .onConflictDoNothing({ target: [issuers.id] });

  await db
    .insert(partners)
    .values({
      id: SEED_PARTNER_B_ID,
      tenantId,
      name: 'Fintech Beta',
    })
    .onConflictDoNothing({ target: [partners.id] });

  await db
    .insert(issuers)
    .values({
      id: SEED_ISSUER_B_ID,
      partnerId: SEED_PARTNER_B_ID,
      tenantId,
      name: 'Beta Verificacao',
      scopes: ['cpf', 'phone', 'endereco'],
    })
    .onConflictDoNothing({ target: [issuers.id] });

  console.log('Seed completed:');
  console.log('  Tenant ID:', tenantId);
  console.log('  Partner ID:', partnerId);
  console.log('  Consumer ID:', SEED_CONSUMER_ID);
  console.log('  Issuer ID:', SEED_ISSUER_ID);
  console.log('  Partner A (Banco Digital Alpha):', SEED_PARTNER_A_ID);
  console.log('  Issuer A (Alpha Credenciais):', SEED_ISSUER_A_ID);
  console.log('  Partner B (Fintech Beta):', SEED_PARTNER_B_ID);
  console.log('  Issuer B (Beta Verificacao):', SEED_ISSUER_B_ID);
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
