import { eq } from 'drizzle-orm';
import type {
  Consent,
  ConsentReceipt,
  ConsentRepositoryPort,
  CreateDataRequestInput,
  DataRequest,
  DataRequestWithDetails,
  RequestItem,
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

    const receiptData = {
      approved: true,
      timestamp: new Date().toISOString(),
      requestId: consentRow.dataRequestId,
      consentId,
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

    const receiptData = {
      approved: false,
      timestamp: new Date().toISOString(),
      requestId: consentRow.dataRequestId,
      consentId,
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
