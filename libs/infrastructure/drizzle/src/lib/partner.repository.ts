import { createHash, randomBytes } from 'node:crypto';
import { eq } from 'drizzle-orm';
import type {
  Consumer,
  CreateConsumerInput,
  CreateIssuerInput,
  Issuer,
  Partner,
  PartnerRepositoryPort,
  PartnerStatus,
  RotateCredentialResult,
  UpdateConsumerInput,
  UpdateIssuerInput,
} from '@ultima-forma/domain-partner';
import {
  consumers,
  integrationCredentials,
  issuers,
  partners,
  tenants,
} from './schema';
import type { DrizzleDB } from './drizzle.module';

function hashSecret(secret: string): string {
  return createHash('sha256').update(secret).digest('hex');
}

function generateSecret(): string {
  return randomBytes(32).toString('hex');
}

export class PartnerRepository implements PartnerRepositoryPort {
  constructor(private readonly db: DrizzleDB) {}

  async findPartnerById(id: string): Promise<Partner | null> {
    const rows = await this.db
      .select()
      .from(partners)
      .where(eq(partners.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      tenantId: row.tenantId,
      name: row.name,
      status: row.status as PartnerStatus,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findIssuerById(id: string): Promise<Issuer | null> {
    const rows = await this.db
      .select()
      .from(issuers)
      .where(eq(issuers.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      partnerId: row.partnerId,
      tenantId: row.tenantId,
      name: row.name,
      status: row.status as PartnerStatus,
      scopes: (row.scopes as string[]) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async findConsumerById(id: string): Promise<Consumer | null> {
    const rows = await this.db
      .select()
      .from(consumers)
      .where(eq(consumers.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      partnerId: row.partnerId,
      tenantId: row.tenantId,
      name: row.name,
      status: row.status as PartnerStatus,
      scopes: (row.scopes as string[]) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async createIssuer(input: CreateIssuerInput): Promise<Issuer> {
    const [row] = await this.db
      .insert(issuers)
      .values({
        partnerId: input.partnerId,
        tenantId: input.tenantId,
        name: input.name,
        scopes: input.scopes ?? [],
      })
      .returning();
    if (!row) throw new Error('Failed to create issuer');
    return {
      id: row.id,
      partnerId: row.partnerId,
      tenantId: row.tenantId,
      name: row.name,
      status: row.status as PartnerStatus,
      scopes: (row.scopes as string[]) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async createConsumer(input: CreateConsumerInput): Promise<Consumer> {
    const [row] = await this.db
      .insert(consumers)
      .values({
        partnerId: input.partnerId,
        tenantId: input.tenantId,
        name: input.name,
        scopes: input.scopes ?? [],
      })
      .returning();
    if (!row) throw new Error('Failed to create consumer');
    return {
      id: row.id,
      partnerId: row.partnerId,
      tenantId: row.tenantId,
      name: row.name,
      status: row.status as PartnerStatus,
      scopes: (row.scopes as string[]) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async updateIssuer(id: string, input: UpdateIssuerInput): Promise<Issuer> {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input['name'] !== undefined) updates['name'] = input['name'];
    if (input['status'] !== undefined) updates['status'] = input['status'];
    if (input['scopes'] !== undefined) updates['scopes'] = input['scopes'];
    const [row] = await this.db
      .update(issuers)
      .set(updates as Record<string, unknown>)
      .where(eq(issuers.id, id))
      .returning();
    if (!row) throw new Error('Failed to update issuer');
    return {
      id: row.id,
      partnerId: row.partnerId,
      tenantId: row.tenantId,
      name: row.name,
      status: row.status as PartnerStatus,
      scopes: (row.scopes as string[]) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async updateConsumer(id: string, input: UpdateConsumerInput): Promise<Consumer> {
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (input['name'] !== undefined) updates['name'] = input['name'];
    if (input['status'] !== undefined) updates['status'] = input['status'];
    if (input['scopes'] !== undefined) updates['scopes'] = input['scopes'];
    const [row] = await this.db
      .update(consumers)
      .set(updates as Record<string, unknown>)
      .where(eq(consumers.id, id))
      .returning();
    if (!row) throw new Error('Failed to update consumer');
    return {
      id: row.id,
      partnerId: row.partnerId,
      tenantId: row.tenantId,
      name: row.name,
      status: row.status as PartnerStatus,
      scopes: (row.scopes as string[]) ?? [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  async rotateIntegrationCredential(partnerId: string): Promise<RotateCredentialResult> {
    const secret = generateSecret();
    const secretHash = hashSecret(secret);

    await this.db
      .update(integrationCredentials)
      .set({ status: 'revoked' })
      .where(eq(integrationCredentials.partnerId, partnerId));

    const [row] = await this.db
      .insert(integrationCredentials)
      .values({
        partnerId,
        secretHash,
      })
      .returning();

    if (!row) throw new Error('Failed to create integration credential');
    return {
      credentialId: row.id,
      secret,
      secretHash,
    };
  }
}
