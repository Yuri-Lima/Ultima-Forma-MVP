import {
  boolean,
  jsonb,
  pgSchema,
  pgTable,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const migrationsMeta = pgTable('_migrations_meta', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  executedAt: timestamp('executed_at').defaultNow().notNull(),
});

const core = pgSchema('core');

export const tenants = core.table('tenants', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const partners = core.table('partners', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const issuers = core.table('issuers', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id')
    .notNull()
    .references(() => partners.id),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  scopes: jsonb('scopes').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const consumers = core.table('consumers', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id')
    .notNull()
    .references(() => partners.id),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  scopes: jsonb('scopes').$type<string[]>().default([]),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const integrationCredentials = core.table('integration_credentials', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id')
    .notNull()
    .references(() => partners.id),
  secretHash: varchar('secret_hash', { length: 255 }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

export const dataRequests = core.table('data_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  consumerId: uuid('consumer_id')
    .notNull()
    .references(() => consumers.id),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  purpose: varchar('purpose', { length: 500 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  idempotencyKey: varchar('idempotency_key', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const requestItems = core.table('request_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  dataRequestId: uuid('data_request_id')
    .notNull()
    .references(() => dataRequests.id),
  claim: varchar('claim', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const consents = core.table('consents', {
  id: uuid('id').primaryKey().defaultRandom(),
  dataRequestId: uuid('data_request_id')
    .notNull()
    .references(() => dataRequests.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const consentReceipts = core.table('consent_receipts', {
  id: uuid('id').primaryKey().defaultRandom(),
  consentId: uuid('consent_id')
    .notNull()
    .references(() => consents.id),
  approved: boolean('approved').notNull(),
  receiptData: jsonb('receipt_data').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
