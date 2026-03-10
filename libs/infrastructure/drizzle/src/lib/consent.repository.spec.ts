/**
 * Integration test for ConsentRepository.
 * Requires DATABASE_URL and a running PostgreSQL with migrations applied.
 * Run: pnpm nx run drizzle:test
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ConsentRepository } from './consent.repository';
import * as schema from './schema';

const DATABASE_URL =
  process.env['DATABASE_URL'] ??
  'postgresql://postgres:postgres@localhost:5432/ultima_forma';

describe('ConsentRepository (integration)', () => {
  let pool: Pool;
  let repo: ConsentRepository;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL });
    const db = drizzle(pool, { schema });
    repo = new ConsentRepository(db);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should create and find data request for user', async () => {
    const consumerRows = await pool.query(
      'SELECT id, tenant_id FROM core.consumers LIMIT 1'
    );
    const consumerId = consumerRows.rows[0]?.id;
    const tenantId = consumerRows.rows[0]?.tenant_id;
    if (!consumerId || !tenantId) {
      console.warn('Skipping: no consumers in DB. Run pnpm db:seed and create a consumer first.');
      return;
    }

    const expiresAt = new Date(Date.now() + 86400000);
    const request = await repo.createDataRequest({
      consumerId,
      tenantId,
      purpose: 'Test integration',
      claims: ['email', 'name'],
      expiresAt,
    });

    expect(request.id).toBeDefined();
    expect(request.status).toBe('pending');

    const forUser = await repo.findDataRequestForUser(request.id);
    expect(forUser).not.toBeNull();
    expect(forUser?.request.id).toBe(request.id);
    expect(forUser?.items).toHaveLength(2);
    expect(forUser?.consent.status).toBe('pending');
    expect(forUser?.consumerName).toBeDefined();
  });
});
