/**
 * Integration test for BillableEventRepository.
 * Requires DATABASE_URL and a running PostgreSQL with migrations applied.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { BillableEventRepository } from './billable-event.repository';
import * as schema from './schema';

const DATABASE_URL =
  process.env['DATABASE_URL'] ??
  'postgresql://postgres:postgres@localhost:5432/ultima_forma';

describe('BillableEventRepository (integration)', () => {
  let pool: Pool;
  let repo: BillableEventRepository;

  beforeAll(async () => {
    pool = new Pool({ connectionString: DATABASE_URL });
    const db = drizzle(pool, { schema });
    repo = new BillableEventRepository(db);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should append and findMany billable events', async () => {
    const tenantRows = await pool.query(
      'SELECT id FROM core.tenants LIMIT 1'
    );
    const requestRows = await pool.query(
      'SELECT id FROM core.data_requests LIMIT 1'
    );
    const tenantId = tenantRows.rows[0]?.id;
    const dataRequestId = requestRows.rows[0]?.id;

    if (!tenantId || !dataRequestId) {
      console.warn(
        'Skipping: no tenants or data_requests in DB. Run pnpm db:seed first.'
      );
      return;
    }

    const event = await repo.append({
      eventType: 'consent_granted',
      dataRequestId,
      tenantId,
      payload: { consentId: 'test-consent', claims: ['email'], trustLevel: 'high' },
    });

    expect(event.id).toBeDefined();
    expect(event.eventType).toBe('consent_granted');
    expect(event.dataRequestId).toBe(dataRequestId);
    expect(event.tenantId).toBe(tenantId);
    expect(event.payload).toMatchObject({
      consentId: 'test-consent',
      claims: ['email'],
      trustLevel: 'high',
    });
    expect(event.createdAt).toBeInstanceOf(Date);

    const found = await repo.findMany(
      { eventType: 'consent_granted', tenantId },
      { limit: 10 }
    );
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found.some((e) => e.id === event.id)).toBe(true);
  });
});
