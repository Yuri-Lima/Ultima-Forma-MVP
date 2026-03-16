import {
  boolean,
  integer,
  jsonb,
  pgSchema,
  pgTable,
  text,
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
  encryptedSecret: text('encrypted_secret'),
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
  userSubjectId: uuid('user_subject_id').references(() => userSubjects.id),
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

export const auditEvents = core.table('audit_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  aggregateType: varchar('aggregate_type', { length: 100 }).notNull(),
  aggregateId: uuid('aggregate_id').notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const billableEvents = core.table('billable_events', {
  id: uuid('id').primaryKey().defaultRandom(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  dataRequestId: uuid('data_request_id')
    .notNull()
    .references(() => dataRequests.id),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const webhookSubscriptions = core.table('webhook_subscriptions', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id')
    .notNull()
    .references(() => partners.id),
  url: varchar('url', { length: 2048 }).notNull(),
  secret: varchar('secret', { length: 255 }),
  eventTypes: jsonb('event_types').$type<string[]>().default([]),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const webhookDeliveries = core.table('webhook_deliveries', {
  id: uuid('id').primaryKey().defaultRandom(),
  subscriptionId: uuid('subscription_id')
    .notNull()
    .references(() => webhookSubscriptions.id),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  payload: jsonb('payload').$type<Record<string, unknown>>().notNull(),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  attempts: integer('attempts').notNull().default(0),
  lastError: text('last_error'),
  nextRetryAt: timestamp('next_retry_at'),
  succeededAt: timestamp('succeeded_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const consentPolicies = core.table('consent_policies', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  name: varchar('name', { length: 255 }).notNull(),
  maxDurationHours: integer('max_duration_hours').notNull(),
  allowedClaims: jsonb('allowed_claims').$type<string[]>().default([]),
  jurisdiction: varchar('jurisdiction', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const consentRevocations = core.table('consent_revocations', {
  id: uuid('id').primaryKey().defaultRandom(),
  consentId: uuid('consent_id')
    .notNull()
    .references(() => consents.id),
  reason: varchar('reason', { length: 500 }),
  revokedBy: varchar('revoked_by', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const claimDefinitions = core.table('claim_definitions', {
  id: uuid('id').primaryKey().defaultRandom(),
  key: varchar('key', { length: 255 }).notNull().unique(),
  namespace: varchar('namespace', { length: 100 }).notNull(),
  displayName: varchar('display_name', { length: 255 }).notNull(),
  description: text('description'),
  sensitivityLevel: varchar('sensitivity_level', { length: 50 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const claimDefinitionVersions = core.table(
  'claim_definition_versions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    claimDefinitionId: uuid('claim_definition_id')
      .notNull()
      .references(() => claimDefinitions.id),
    version: integer('version').notNull(),
    jsonSchema: jsonb('json_schema')
      .$type<Record<string, unknown>>()
      .notNull(),
    status: varchar('status', { length: 50 }).notNull().default('active'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  }
);

export const partnerClaimPermissions = core.table(
  'partner_claim_permissions',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    partnerId: uuid('partner_id')
      .notNull()
      .references(() => partners.id),
    claimDefinitionId: uuid('claim_definition_id')
      .notNull()
      .references(() => claimDefinitions.id),
    permissionType: varchar('permission_type', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  }
);

export const userSubjects = core.table('user_subjects', {
  id: uuid('id').primaryKey().defaultRandom(),
  tenantId: uuid('tenant_id')
    .notNull()
    .references(() => tenants.id),
  externalSubjectRef: varchar('external_subject_ref', { length: 255 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const credentialReferences = core.table('credential_references', {
  id: uuid('id').primaryKey().defaultRandom(),
  userSubjectId: uuid('user_subject_id')
    .notNull()
    .references(() => userSubjects.id),
  issuerId: uuid('issuer_id')
    .notNull()
    .references(() => issuers.id),
  claimDefinitionId: uuid('claim_definition_id').references(
    () => claimDefinitions.id
  ),
  externalCredentialRef: varchar('external_credential_ref', {
    length: 255,
  }).notNull(),
  status: varchar('status', { length: 50 }).notNull().default('active'),
  issuedAt: timestamp('issued_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const presentationSessions = core.table('presentation_sessions', {
  id: uuid('id').primaryKey().defaultRandom(),
  dataRequestId: uuid('data_request_id')
    .notNull()
    .references(() => dataRequests.id),
  userSubjectId: uuid('user_subject_id')
    .notNull()
    .references(() => userSubjects.id),
  status: varchar('status', { length: 50 }).notNull().default('pending'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const partnerApiNonces = core.table('partner_api_nonces', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id')
    .notNull()
    .references(() => partners.id),
  nonceHash: varchar('nonce_hash', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const partnerApiUsage = core.table('partner_api_usage', {
  id: uuid('id').primaryKey().defaultRandom(),
  partnerId: uuid('partner_id')
    .notNull()
    .references(() => partners.id),
  route: varchar('route', { length: 500 }).notNull(),
  method: varchar('method', { length: 10 }).notNull(),
  statusCode: integer('status_code').notNull(),
  correlationId: varchar('correlation_id', { length: 255 }),
  responseTimeMs: integer('response_time_ms'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
