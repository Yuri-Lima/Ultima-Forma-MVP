import { and, eq, sql } from 'drizzle-orm';
import type {
  CreateWebhookInput,
  IntegrationCredential,
  PartnerDashboardMetrics,
  PartnerDashboardRepositoryPort,
  UpdateWebhookInput,
  WebhookSubscriptionSummary,
} from '@ultima-forma/domain-partner';
import type {
  DataRequestListItem,
  ListDataRequestsPagination,
} from '@ultima-forma/domain-consent';
import {
  consumers,
  dataRequests,
  integrationCredentials,
  partnerApiUsage,
  webhookSubscriptions,
} from './schema';
import type { DrizzleDB } from './drizzle.module';

export class PartnerDashboardRepository
  implements PartnerDashboardRepositoryPort
{
  constructor(private readonly db: DrizzleDB) {}

  async getDashboardMetrics(
    partnerId: string
  ): Promise<PartnerDashboardMetrics> {
    const consumerRows = await this.db
      .select({ id: consumers.id })
      .from(consumers)
      .where(eq(consumers.partnerId, partnerId));
    const consumerIds = consumerRows.map((c) => c.id);

    let totalRequests = 0;
    let pendingRequests = 0;
    let completedRequests = 0;

    if (consumerIds.length > 0) {
      const reqStats = await this.db
        .select({
          total: sql<number>`count(*)::int`,
          pending: sql<number>`count(*) filter (where ${dataRequests.status} = 'pending')::int`,
          completed: sql<number>`count(*) filter (where ${dataRequests.status} = 'completed')::int`,
        })
        .from(dataRequests)
        .where(sql`${dataRequests.consumerId} in ${consumerIds}`);
      totalRequests = reqStats[0]?.total ?? 0;
      pendingRequests = reqStats[0]?.pending ?? 0;
      completedRequests = reqStats[0]?.completed ?? 0;
    }

    const apiStats = await this.db
      .select({
        total: sql<number>`count(*)::int`,
        failed: sql<number>`count(*) filter (where ${partnerApiUsage.statusCode} >= 400)::int`,
      })
      .from(partnerApiUsage)
      .where(eq(partnerApiUsage.partnerId, partnerId));

    const credCount = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(integrationCredentials)
      .where(
        and(
          eq(integrationCredentials.partnerId, partnerId),
          eq(integrationCredentials.status, 'active')
        )
      );

    const whCount = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(webhookSubscriptions)
      .where(
        and(
          eq(webhookSubscriptions.partnerId, partnerId),
          eq(webhookSubscriptions.status, 'active')
        )
      );

    return {
      totalRequests,
      pendingRequests,
      completedRequests,
      totalApiCalls: apiStats[0]?.total ?? 0,
      failedApiCalls: apiStats[0]?.failed ?? 0,
      activeCredentials: credCount[0]?.count ?? 0,
      activeWebhooks: whCount[0]?.count ?? 0,
    };
  }

  async listPartnerRequests(
    partnerId: string,
    filters?: { status?: string },
    pagination?: ListDataRequestsPagination
  ): Promise<{ items: DataRequestListItem[]; total: number }> {
    const consumerRows = await this.db
      .select({ id: consumers.id })
      .from(consumers)
      .where(eq(consumers.partnerId, partnerId));
    const consumerIds = consumerRows.map((c) => c.id);
    if (consumerIds.length === 0) return { items: [], total: 0 };

    const conditions = [sql`${dataRequests.consumerId} in ${consumerIds}`];
    if (filters?.status) {
      conditions.push(eq(dataRequests.status, filters.status));
    }
    const whereClause = and(...conditions);
    const limit = pagination?.limit ?? 50;
    const offset = pagination?.offset ?? 0;

    const countResult = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(dataRequests)
      .where(whereClause);

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

    return {
      items: rows.map((r) => ({
        ...r,
        status: r.status as DataRequestListItem['status'],
      })),
      total: countResult[0]?.count ?? 0,
    };
  }

  async listPartnerCredentials(
    partnerId: string
  ): Promise<IntegrationCredential[]> {
    const rows = await this.db
      .select()
      .from(integrationCredentials)
      .where(eq(integrationCredentials.partnerId, partnerId))
      .orderBy(integrationCredentials.createdAt);

    return rows.map((r) => ({
      id: r.id,
      partnerId: r.partnerId,
      secretHash: r.secretHash,
      encryptedSecret: r.encryptedSecret,
      status: r.status as IntegrationCredential['status'],
      createdAt: r.createdAt,
      expiresAt: r.expiresAt,
    }));
  }

  async listPartnerWebhooks(
    partnerId: string
  ): Promise<WebhookSubscriptionSummary[]> {
    const rows = await this.db
      .select()
      .from(webhookSubscriptions)
      .where(eq(webhookSubscriptions.partnerId, partnerId))
      .orderBy(webhookSubscriptions.createdAt);

    return rows.map((r) => ({
      id: r.id,
      url: r.url,
      eventTypes: (r.eventTypes as string[]) ?? [],
      status: r.status,
      createdAt: r.createdAt,
    }));
  }

  async createWebhook(
    input: CreateWebhookInput
  ): Promise<WebhookSubscriptionSummary> {
    const [row] = await this.db
      .insert(webhookSubscriptions)
      .values({
        partnerId: input.partnerId,
        url: input.url,
        eventTypes: input.eventTypes,
        secret: input.secret ?? null,
      })
      .returning();

    if (!row) throw new Error('Failed to create webhook');
    return {
      id: row.id,
      url: row.url,
      eventTypes: (row.eventTypes as string[]) ?? [],
      status: row.status,
      createdAt: row.createdAt,
    };
  }

  async updateWebhook(
    id: string,
    input: UpdateWebhookInput
  ): Promise<WebhookSubscriptionSummary> {
    const values: Record<string, unknown> = { updatedAt: new Date() };
    if (input.url !== undefined) values['url'] = input.url;
    if (input.eventTypes !== undefined) values['eventTypes'] = input.eventTypes;
    if (input.status !== undefined) values['status'] = input.status;

    const [row] = await this.db
      .update(webhookSubscriptions)
      .set(values)
      .where(eq(webhookSubscriptions.id, id))
      .returning();

    if (!row) throw new Error('Webhook not found');
    return {
      id: row.id,
      url: row.url,
      eventTypes: (row.eventTypes as string[]) ?? [],
      status: row.status,
      createdAt: row.createdAt,
    };
  }
}
