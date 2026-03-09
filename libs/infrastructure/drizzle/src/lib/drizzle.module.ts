import { Global, Module } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

export const DRIZZLE = 'DRIZZLE';

export type DrizzleDB = NodePgDatabase<typeof schema>;

const DEFAULT_URL = 'postgresql://postgres:postgres@localhost:5432/ultima_forma';

export const DrizzleProvider = {
  provide: DRIZZLE,
  useFactory: (): DrizzleDB => {
    const connectionString =
      process.env['DATABASE_URL'] ?? DEFAULT_URL;
    const pool = new Pool({ connectionString });
    return drizzle(pool, { schema });
  },
};

@Global()
@Module({
  providers: [DrizzleProvider],
  exports: [DRIZZLE],
})
export class DrizzleModule {}
