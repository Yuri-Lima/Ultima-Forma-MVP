import { and, eq, sql } from 'drizzle-orm';
import type {
  Consent,
  ConsentReceipt,
  ConsentRepositoryPort,
  CreateDataRequestInput,
  DataRequest,
  DataRequestListItem,
  DataRequestResultForConsumer,
  DataRequestWithDetails,
  ListDataRequestsFilters,
  ListDataRequestsPagination,
  RequestItem,
  TrustLevel,
  VerificationResult,
} from '@ultima-forma/domain-consent';
import {
  consentReceipts,
  consents,
  consumers,
  dataRequests,
  requestItems,
} from './schema';
import type { DrizzleDB } from './drizzle.module';

export class ConsentRepository implements ConsentRepositoryPort {
  constructor(private readonly db: DrizzleDB) {}

  async createDataRequest(input: CreateDataRequestInput): Promise<DataRequest> {
    const [requestRow] = await this.db
      .insert(dataRequests)
      .values({
        consumerId: input.consumerId,
        tenantId: input.tenantId,
        purpose: input.purpose,
        expiresAt: input.expiresAt,
        idempotencyKey: input.idempotencyKey ?? null,
      })
      .returning();

    if (!requestRow) throw new Error('Failed to create data request');

    await this.db.insert(requestItems).values(
      input.claims.map((claim) => ({
        dataRequestId: requestRow.id,
        claim,
      }))
    );

    const [consentRow] = await this.db
      .insert(consents)
      .values({
        dataRequestId: requestRow.id,
      })
      .returning();

    if (!consentRow) throw new Error('Failed to create consent');

    return this.toDataRequest(requestRow);
  }

  async findDataRequestById(id: string): Promise<DataRequest | null> {
    const rows = await this.db
      .select()
      .from(dataRequests)
      .where(eq(dataRequests.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.toDataRequest(row);
  }

  async findDataRequestForUser(
    id: string
  ): Promise<DataRequestWithDetails | null> {
    const requestRows = await this.db
      .select()
      .from(dataRequests)
      .where(eq(dataRequests.id, id))
      .limit(1);
    const requestRow = requestRows[0];
    if (!requestRow) return null;

    const itemRows = await this.db
      .select()
      .from(requestItems)
      .where(eq(requestItems.dataRequestId, id));

    const consentRows = await this.db
      .select()
      .from(consents)
      .where(eq(consents.dataRequestId, id))
      .limit(1);
    const consentRow = consentRows[0];
    if (!consentRow) return null;

    const consumerRows = await this.db
      .select()
      .from(consumers)
      .where(eq(consumers.id, requestRow.consumerId))
      .limit(1);
    const consumerRow = consumerRows[0];
    if (!consumerRow) return null;

    return {
      request: this.toDataRequest(requestRow),
      items: itemRows.map((r) => this.toRequestItem(r)),
      consent: this.toConsent(consentRow),
      consumerName: consumerRow.name,
    };
  }

  async findConsentById(id: string): Promise<Consent | null> {
    const rows = await this.db
      .select()
      .from(consents)
      .where(eq(consents.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.toConsent(row);
  }

  async findConsentByRequestId(requestId: string): Promise<Consent | null> {
    const rows = await this.db
      .select()
      .from(consents)
      .where(eq(consents.dataRequestId, requestId))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.toConsent(row);
  }

  async approveConsent(consentId: string): Promise<ConsentReceipt> {
    const consentRows = await this.db
      .select()
      .from(consents)
      .where(eq(consents.id, consentId))
      .limit(1);
    const consentRow = consentRows[0];
    if (!consentRow) throw new Error('Consent not found');

    const itemRows = await this.db
      .select({ claim: requestItems.claim })
      .from(requestItems)
      .where(eq(requestItems.dataRequestId, consentRow.dataRequestId));
    const verifiedClaims = itemRows.map((r) => r.claim);
    const verifiedAt = new Date();

    const receiptData = {
      approved: true,
      timestamp: verifiedAt.toISOString(),
      requestId: consentRow.dataRequestId,
      consentId,
      trustLevel: 'high',
      verificationResult: {
        trustLevel: 'high',
        verifiedAt: verifiedAt.toISOString(),
        verifiedClaims,
      },
    };

    const [receiptRow] = await this.db
      .insert(consentReceipts)
      .values({
        consentId,
        approved: true,
        receiptData,
      })
      .returning();

    if (!receiptRow) throw new Error('Failed to create consent receipt');

    await this.db
      .update(consents)
      .set({ status: 'approved', updatedAt: new Date() })
      .where(eq(consents.id, consentId));

    await this.db
      .update(dataRequests)
      .set({ status: 'completed', updatedAt: new Date() })
      .where(eq(dataRequests.id, consentRow.dataRequestId));

    return {
      id: receiptRow.id,
      consentId: receiptRow.consentId,
      approved: receiptRow.approved,
      receiptData: receiptRow.receiptData as Record<string, unknown>,
      createdAt: receiptRow.createdAt,
    };
  }

  async rejectConsent(consentId: string): Promise<ConsentReceipt> {
    const consentRows = await this.db
      .select()
      .from(consents)
      .where(eq(consents.id, consentId))
      .limit(1);
    const consentRow = consentRows[0];
    if (!consentRow) throw new Error('Consent not found');

    const verifiedAt = new Date();
    const receiptData = {
      approved: false,
      timestamp: verifiedAt.toISOString(),
      requestId: consentRow.dataRequestId,
      consentId,
      trustLevel: 'low',
      verificationResult: {
        trustLevel: 'low',
        verifiedAt: verifiedAt.toISOString(),
        verifiedClaims: [],
      },
    };

    const [receiptRow] = await this.db
      .insert(consentReceipts)
      .values({
        consentId,
        approved: false,
        receiptData,
      })
      .returning();

    if (!receiptRow) throw new Error('Failed to create consent receipt');

    await this.db
      .update(consents)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(consents.id, consentId));

    await this.db
      .update(dataRequests)
      .set({ status: 'rejected', updatedAt: new Date() })
      .where(eq(dataRequests.id, consentRow.dataRequestId));

    return {
      id: receiptRow.id,
      consentId: receiptRow.consentId,
      approved: receiptRow.approved,
      receiptData: receiptRow.receiptData as Record<string, unknown>,
      createdAt: receiptRow.createdAt,
    };
  }

  async expireRequest(requestId: string): Promise<DataRequest> {
    const [row] = await this.db
      .update(dataRequests)
      .set({ status: 'expired', updatedAt: new Date() })
      .where(eq(dataRequests.id, requestId))
      .returning();

    if (!row) throw new Error('Data request not found');
    return this.toDataRequest(row);
  }

  async findByIdempotencyKey(key: string): Promise<DataRequest | null> {
    const rows = await this.db
      .select()
      .from(dataRequests)
      .where(eq(dataRequests.idempotencyKey, key))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.toDataRequest(row);
  }

  async listDataRequests(
    filters?: ListDataRequestsFilters,
    pagination?: ListDataRequestsPagination
  ): Promise<{ items: DataRequestListItem[]; total: number }> {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filters?.status) {
      conditions.push(eq(dataRequests.status, filters.status));
    }
    if (filters?.tenantId) {
      conditions.push(eq(dataRequests.tenantId, filters.tenantId));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const limit = pagination?.limit ?? 50;
    const offset = pagination?.offset ?? 0;

    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(dataRequests)
      .where(whereClause);
    const total = countResult[0]?.count ?? 0;

    const rows = await this.db
      .select({
        id: dataRequests.id,
        consumerId: dataRequests.consumerId,
        tenantId: dataRequests.tenantId,
        status: dataRequests.status,
        purpose: dataRequests.purpose,
        expiresAt: dataRequests.expiresAt,
        idempotencyKey: dataRequests.idempotencyKey,
        createdAt: dataRequests.createdAt,
        updatedAt: dataRequests.updatedAt,
        consumerName: consumers.name,
      })
      .from(dataRequests)
      .innerJoin(consumers, eq(dataRequests.consumerId, consumers.id))
      .where(whereClause)
      .orderBy(dataRequests.createdAt)
      .limit(limit)
      .offset(offset);

    const items: DataRequestListItem[] = rows.map((row) => ({
      id: row.id,
      consumerId: row.consumerId,
      tenantId: row.tenantId,
      status: row.status as DataRequest['status'],
      purpose: row.purpose,
      expiresAt: row.expiresAt,
      idempotencyKey: row.idempotencyKey,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      consumerName: row.consumerName,
    }));

    return { items, total };
  }

  async findDataRequestResultForConsumer(
    requestId: string
  ): Promise<DataRequestResultForConsumer | null> {
    const requestRows = await this.db
      .select()
      .from(dataRequests)
      .where(eq(dataRequests.id, requestId))
      .limit(1);
    const requestRow = requestRows[0];
    if (!requestRow) return null;

    const itemRows = await this.db
      .select({ claim: requestItems.claim })
      .from(requestItems)
      .where(eq(requestItems.dataRequestId, requestId));
    const claims = itemRows.map((r) => r.claim);

    const consumerRows = await this.db
      .select({ name: consumers.name })
      .from(consumers)
      .where(eq(consumers.id, requestRow.consumerId))
      .limit(1);
    const consumerRow = consumerRows[0];
    if (!consumerRow) return null;

    let receipt: DataRequestResultForConsumer['receipt'];

    if (
      requestRow.status === 'completed' ||
      requestRow.status === 'rejected'
    ) {
      const consentRows = await this.db
        .select()
        .from(consents)
        .where(eq(consents.dataRequestId, requestId))
        .limit(1);
      const consentRow = consentRows[0];
      if (!consentRow) return null;

      const receiptRows = await this.db
        .select()
        .from(consentReceipts)
        .where(eq(consentReceipts.consentId, consentRow.id))
        .limit(1);
      const receiptRow = receiptRows[0];
      if (!receiptRow) return null;

      const data = receiptRow.receiptData as Record<string, unknown>;
      const trustLevel =
        (data['trustLevel'] as TrustLevel) ??
        (receiptRow.approved ? 'high' : 'low');
      const verificationResultRaw = data[
        'verificationResult'
      ] as Record<string, unknown> | undefined;
      let verificationResult: VerificationResult | undefined;
      if (verificationResultRaw) {
        const va = verificationResultRaw['verifiedAt'];
        verificationResult = {
          trustLevel: (verificationResultRaw['trustLevel'] as TrustLevel) ?? trustLevel,
          verifiedAt: typeof va === 'string' ? new Date(va) : (va as Date),
          verifiedClaims: verificationResultRaw[
            'verifiedClaims'
          ] as string[] | undefined,
        };
      }

      receipt = {
        id: receiptRow.id,
        approved: receiptRow.approved,
        trustLevel,
        verificationResult,
      };
    }

    return {
      requestId: requestRow.id,
      status: requestRow.status as DataRequestResultForConsumer['status'],
      consumerId: requestRow.consumerId,
      consumerName: consumerRow.name,
      purpose: requestRow.purpose,
      claims,
      expiresAt: requestRow.expiresAt,
      createdAt: requestRow.createdAt,
      receipt,
    };
  }

  private toDataRequest(row: (typeof dataRequests.$inferSelect)): DataRequest {
    return {
      id: row.id,
      consumerId: row.consumerId,
      tenantId: row.tenantId,
      status: row.status as DataRequest['status'],
      purpose: row.purpose,
      expiresAt: row.expiresAt,
      idempotencyKey: row.idempotencyKey,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }

  private toRequestItem(row: (typeof requestItems.$inferSelect)): RequestItem {
    return {
      id: row.id,
      dataRequestId: row.dataRequestId,
      claim: row.claim,
      createdAt: row.createdAt,
    };
  }

  private toConsent(row: (typeof consents.$inferSelect)): Consent {
    return {
      id: row.id,
      dataRequestId: row.dataRequestId,
      status: row.status as Consent['status'],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
