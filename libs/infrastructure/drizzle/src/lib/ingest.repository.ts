import { eq, and, desc, sql, gte } from 'drizzle-orm';
import {
  profileSubmissions,
  issuers,
  partners,
  userSubjects,
  walletEntries,
  dataRequestTokens,
  tenants,
} from './schema';
import type { DrizzleDB } from './drizzle.module';
import { randomUUID } from 'node:crypto';

export interface ProfileSubmission {
  id: string;
  issuerId: string;
  tenantId: string;
  cpf: string;
  phone: string;
  extraFields: string[];
  status: string;
  createdAt: Date;
}

export interface ProfileSubmissionWithIssuer extends ProfileSubmission {
  issuerName: string;
  partnerName: string;
}

export interface WalletEntry {
  id: string;
  userSubjectId: string;
  issuerId: string;
  fieldName: string;
  fieldValue: string | null;
  receivedAt: Date | null;
  createdAt: Date;
}

export interface IssuerDiscoveryResult {
  issuerId: string;
  issuerName: string;
  partnerName: string;
  fields: string[];
  lastUpdated: string;
}

export class IngestRepository {
  constructor(private readonly db: DrizzleDB) {}

  async createProfileSubmission(input: {
    issuerId: string;
    tenantId: string;
    cpf: string;
    phone: string;
    extraFields: string[];
  }): Promise<ProfileSubmission> {
    const [row] = await this.db
      .insert(profileSubmissions)
      .values({
        issuerId: input.issuerId,
        tenantId: input.tenantId,
        cpf: input.cpf,
        phone: input.phone,
        extraFields: input.extraFields,
      })
      .returning();
    if (!row) throw new Error('Failed to create profile submission');
    return {
      id: row.id,
      issuerId: row.issuerId,
      tenantId: row.tenantId,
      cpf: row.cpf,
      phone: row.phone,
      extraFields: (row.extraFields as string[]) ?? [],
      status: row.status,
      createdAt: row.createdAt,
    };
  }

  async findSubmissions(opts: {
    limit?: number;
    offset?: number;
    since?: string;
  }): Promise<{ items: ProfileSubmissionWithIssuer[]; total: number }> {
    const limit = opts.limit ?? 50;
    const offset = opts.offset ?? 0;
    const conditions = [];

    if (opts.since) {
      conditions.push(gte(profileSubmissions.createdAt, new Date(opts.since)));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await this.db
      .select({
        id: profileSubmissions.id,
        issuerId: profileSubmissions.issuerId,
        tenantId: profileSubmissions.tenantId,
        cpf: profileSubmissions.cpf,
        phone: profileSubmissions.phone,
        extraFields: profileSubmissions.extraFields,
        status: profileSubmissions.status,
        createdAt: profileSubmissions.createdAt,
        issuerName: issuers.name,
        partnerName: partners.name,
      })
      .from(profileSubmissions)
      .innerJoin(issuers, eq(profileSubmissions.issuerId, issuers.id))
      .innerJoin(partners, eq(issuers.partnerId, partners.id))
      .where(whereClause)
      .orderBy(desc(profileSubmissions.createdAt))
      .limit(limit)
      .offset(offset);

    const [countResult] = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(profileSubmissions)
      .where(whereClause);

    return {
      items: rows.map((r) => ({
        id: r.id,
        issuerId: r.issuerId,
        tenantId: r.tenantId,
        cpf: r.cpf,
        phone: r.phone,
        extraFields: (r.extraFields as string[]) ?? [],
        status: r.status,
        createdAt: r.createdAt,
        issuerName: r.issuerName,
        partnerName: r.partnerName,
      })),
      total: countResult?.count ?? 0,
    };
  }

  async discoverIssuersForCpf(cpf: string): Promise<IssuerDiscoveryResult[]> {
    const rows = await this.db
      .select({
        issuerId: profileSubmissions.issuerId,
        issuerName: issuers.name,
        partnerName: partners.name,
        extraFields: profileSubmissions.extraFields,
        createdAt: profileSubmissions.createdAt,
      })
      .from(profileSubmissions)
      .innerJoin(issuers, eq(profileSubmissions.issuerId, issuers.id))
      .innerJoin(partners, eq(issuers.partnerId, partners.id))
      .where(eq(profileSubmissions.cpf, cpf))
      .orderBy(desc(profileSubmissions.createdAt));

    const grouped = new Map<string, IssuerDiscoveryResult>();
    for (const row of rows) {
      if (!grouped.has(row.issuerId)) {
        const baseFields = ['cpf', 'phone'];
        const extra = (row.extraFields as string[]) ?? [];
        grouped.set(row.issuerId, {
          issuerId: row.issuerId,
          issuerName: row.issuerName,
          partnerName: row.partnerName,
          fields: [...baseFields, ...extra],
          lastUpdated: row.createdAt.toISOString(),
        });
      }
    }

    return Array.from(grouped.values());
  }

  async findSubmissionByIssuerAndCpf(
    issuerId: string,
    cpf: string
  ): Promise<ProfileSubmission | null> {
    const rows = await this.db
      .select()
      .from(profileSubmissions)
      .where(
        and(
          eq(profileSubmissions.issuerId, issuerId),
          eq(profileSubmissions.cpf, cpf)
        )
      )
      .orderBy(desc(profileSubmissions.createdAt))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      issuerId: row.issuerId,
      tenantId: row.tenantId,
      cpf: row.cpf,
      phone: row.phone,
      extraFields: (row.extraFields as string[]) ?? [],
      status: row.status,
      createdAt: row.createdAt,
    };
  }

  async createDataRequestToken(
    userSubjectId: string,
    issuerId: string
  ): Promise<string> {
    const token = randomUUID();
    await this.db.insert(dataRequestTokens).values({
      userSubjectId,
      issuerId,
      token,
    });
    return token;
  }

  async validateAndConsumeToken(
    token: string
  ): Promise<{ userSubjectId: string; issuerId: string } | null> {
    const rows = await this.db
      .select()
      .from(dataRequestTokens)
      .where(
        and(
          eq(dataRequestTokens.token, token),
          eq(dataRequestTokens.status, 'pending')
        )
      )
      .limit(1);
    const row = rows[0];
    if (!row) return null;

    await this.db
      .update(dataRequestTokens)
      .set({ status: 'used', usedAt: new Date() })
      .where(eq(dataRequestTokens.id, row.id));

    return { userSubjectId: row.userSubjectId, issuerId: row.issuerId };
  }

  async upsertWalletEntries(
    userSubjectId: string,
    issuerId: string,
    fields: { name: string; value: string }[]
  ): Promise<number> {
    let count = 0;
    for (const field of fields) {
      const existing = await this.db
        .select()
        .from(walletEntries)
        .where(
          and(
            eq(walletEntries.userSubjectId, userSubjectId),
            eq(walletEntries.issuerId, issuerId),
            eq(walletEntries.fieldName, field.name)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await this.db
          .update(walletEntries)
          .set({ fieldValue: field.value, receivedAt: new Date() })
          .where(eq(walletEntries.id, existing[0].id));
      } else {
        await this.db.insert(walletEntries).values({
          userSubjectId,
          issuerId,
          fieldName: field.name,
          fieldValue: field.value,
          receivedAt: new Date(),
        });
      }
      count++;
    }
    return count;
  }

  async getWalletEntries(
    userSubjectId: string,
    issuerId?: string
  ): Promise<WalletEntry[]> {
    const conditions = [eq(walletEntries.userSubjectId, userSubjectId)];
    if (issuerId) {
      conditions.push(eq(walletEntries.issuerId, issuerId));
    }

    const rows = await this.db
      .select()
      .from(walletEntries)
      .where(and(...conditions))
      .orderBy(walletEntries.fieldName);

    return rows.map((r) => ({
      id: r.id,
      userSubjectId: r.userSubjectId,
      issuerId: r.issuerId,
      fieldName: r.fieldName,
      fieldValue: r.fieldValue,
      receivedAt: r.receivedAt,
      createdAt: r.createdAt,
    }));
  }

  async registerClient(
    tenantId: string,
    cpf: string,
    phone: string
  ): Promise<{ id: string; cpf: string; phone: string; createdAt: Date }> {
    const existing = await this.db
      .select()
      .from(userSubjects)
      .where(eq(userSubjects.externalSubjectRef, cpf))
      .limit(1);

    if (existing.length > 0) {
      return {
        id: existing[0].id,
        cpf,
        phone,
        createdAt: existing[0].createdAt,
      };
    }

    const [row] = await this.db
      .insert(userSubjects)
      .values({ tenantId, externalSubjectRef: cpf })
      .returning();
    if (!row) throw new Error('Failed to register client');
    return { id: row.id, cpf, phone, createdAt: row.createdAt };
  }

  async findUserSubjectById(
    id: string
  ): Promise<{ id: string; tenantId: string; externalSubjectRef: string } | null> {
    const rows = await this.db
      .select()
      .from(userSubjects)
      .where(eq(userSubjects.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return {
      id: row.id,
      tenantId: row.tenantId,
      externalSubjectRef: row.externalSubjectRef,
    };
  }

  async getDefaultTenantId(): Promise<string> {
    const rows = await this.db.select().from(tenants).limit(1);
    if (!rows[0]) throw new Error('No tenant found');
    return rows[0].id;
  }
}
