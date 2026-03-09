import { pgTable, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

export const migrationsMeta = pgTable('_migrations_meta', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  executedAt: timestamp('executed_at').defaultNow().notNull(),
});
