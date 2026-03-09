/**
 * Integration test for PartnerRepository.
 * Requires DATABASE_URL and a running PostgreSQL with migrations applied.
 * Run: DATABASE_URL=... pnpm nx run drizzle:test
 */
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { PartnerRepository } from './partner.repository';
import * as schema from './schema';

const DATABASE_URL =
  process.env['DATABASE_URL'] ??
  'postgresql://postgres:postgres@localhost:5432/ultima_forma';

describe('PartnerRepository (integration)', () => {
  let pool: Pool;
  let repo: PartnerRepository;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL });
    const db = drizzle(pool, { schema });
    repo = new PartnerRepository(db);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should find partner by id when partners exist', async () => {
    const db = drizzle(pool, { schema });
    const rows = await db.select().from(schema.partners).limit(1);
    const partnerId = rows[0]?.id;
    if (!partnerId) {
      console.warn('Skipping: no partners in DB. Run pnpm db:seed first.');
      return;
    }
    const partner = await repo.findPartnerById(partnerId);
    expect(partner).not.toBeNull();
    expect(partner?.id).toBe(partnerId);
  });
});
