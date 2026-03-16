import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import * as path from 'path';

config();

const LOG_PREFIX = '[migrate-safe]';

function log(level: 'info' | 'warn' | 'error', message: string, meta?: Record<string, unknown>) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message: `${LOG_PREFIX} ${message}`,
    ...meta,
  };
  if (level === 'error') {
    console.error(JSON.stringify(entry));
  } else {
    console.log(JSON.stringify(entry));
  }
}

async function run() {
  const connectionString =
    process.env['DATABASE_URL'] ??
    'postgresql://postgres:postgres@localhost:5432/ultima_forma';

  const nodeEnv = process.env['NODE_ENV'] ?? 'development';
  log('info', 'Starting safe migration', { environment: nodeEnv });

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  const migrationsFolder = path.join(process.cwd(), 'drizzle');
  log('info', 'Migrations folder', { path: migrationsFolder });

  const startTime = Date.now();

  try {
    await migrate(db, { migrationsFolder });
    const elapsed = Date.now() - startTime;
    log('info', 'Migrations applied successfully', { elapsedMs: elapsed });
  } catch (err) {
    const elapsed = Date.now() - startTime;
    log('error', 'Migration failed', {
      elapsedMs: elapsed,
      error: err instanceof Error ? err.message : String(err),
    });
    await pool.end();
    process.exit(1);
  }

  await pool.end();
  log('info', 'Migration complete, connection pool closed');
}

run().catch((err) => {
  log('error', 'Unexpected error during migration', {
    error: err instanceof Error ? err.message : String(err),
  });
  process.exit(1);
});
