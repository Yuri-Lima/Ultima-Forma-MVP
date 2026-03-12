/**
 * Integration test for AuditRepository.
 * Requires DATABASE_URL and a running PostgreSQL with migrations applied.
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { AuditRepository } from './audit.repository';
import * as schema from './schema';

const DATABASE_URL =
  process.env['DATABASE_URL'] ??
  'postgresql://postgres:postgres@localhost:5432/ultima_forma';

describe('AuditRepository (integration)', () => {
  let pool: Pool;
  let repo: AuditRepository;

  beforeAll(() => {
    pool = new Pool({ connectionString: DATABASE_URL });
    const db = drizzle(pool, { schema });
    repo = new AuditRepository(db);
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should append and findMany audit events', async () => {
    const event = await repo.append({
      eventType: 'request_created',
      aggregateType: 'data_request',
      aggregateId: '00000000-0000-0000-0000-000000000001',
      payload: { requestId: 'test-1', status: 'pending' },
    });

    expect(event.id).toBeDefined();
    expect(event.eventType).toBe('request_created');
    expect(event.aggregateType).toBe('data_request');
    expect(event.aggregateId).toBe('00000000-0000-0000-0000-000000000001');
    expect(event.payload).toMatchObject({ requestId: 'test-1', status: 'pending' });
    expect(event.createdAt).toBeInstanceOf(Date);

    const found = await repo.findMany(
      { eventType: 'request_created' },
      { limit: 10 }
    );
    expect(found.length).toBeGreaterThanOrEqual(1);
    expect(found.some((e) => e.id === event.id)).toBe(true);

    const count = await repo.count({ eventType: 'request_created' });
    expect(count).toBeGreaterThanOrEqual(1);
  });
});
