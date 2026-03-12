import { and, eq, or, lte, lt, sql } from 'drizzle-orm';
import { AppError } from '@ultima-forma/shared-errors';
import type {
  CreateWebhookDeliveryInput,
  WebhookDelivery,
  WebhookDeliveryFilters,
  WebhookDeliveryRepositoryPort,
  PaginationOptions,
} from '@ultima-forma/domain-webhook';
import { webhookDeliveries } from './schema';
import type { DrizzleDB } from './drizzle.module';

export class WebhookDeliveryRepository implements WebhookDeliveryRepositoryPort {
  constructor(private readonly db: DrizzleDB) {}

  async create(input: CreateWebhookDeliveryInput): Promise<WebhookDelivery> {
    const [row] = await this.db
      .insert(webhookDeliveries)
      .values({
        subscriptionId: input.subscriptionId,
        eventType: input.eventType,
        payload: input.payload,
      })
      .returning();

    if (!row) throw new AppError('WEBHOOK_DELIVERY_CREATE_FAILED', 'Failed to create webhook delivery', 500);

    return this.mapRow(row);
  }

  async findById(id: string): Promise<WebhookDelivery | null> {
    const rows = await this.db
      .select()
      .from(webhookDeliveries)
      .where(eq(webhookDeliveries.id, id))
      .limit(1);

    const row = rows[0];
    if (!row) return null;

    return this.mapRow(row);
  }

  async findPendingForRetry(limit = 50): Promise<WebhookDelivery[]> {
    const now = new Date();
    const rows = await this.db
      .select()
      .from(webhookDeliveries)
      .where(
        or(
          eq(webhookDeliveries.status, 'pending'),
          and(
            eq(webhookDeliveries.status, 'failed'),
            lte(webhookDeliveries.nextRetryAt, now),
            lt(webhookDeliveries.attempts, 5)
          )
        )
      )
      .orderBy(webhookDeliveries.createdAt)
      .limit(limit);

    return rows.map(this.mapRow);
  }

  async findMany(
    filters?: WebhookDeliveryFilters,
    pagination?: PaginationOptions
  ): Promise<WebhookDelivery[]> {
    const conditions = this.buildConditions(filters);
    let query = this.db
      .select()
      .from(webhookDeliveries)
      .orderBy(sql`${webhookDeliveries.createdAt} DESC`);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const lim = pagination?.limit ?? 50;
    const off = pagination?.offset ?? 0;

    const rows = await query.limit(lim).offset(off);

    return rows.map(this.mapRow);
  }

  async count(filters?: WebhookDeliveryFilters): Promise<number> {
    const conditions = this.buildConditions(filters);
    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(webhookDeliveries);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const [result] = await query;
    return result?.count ?? 0;
  }

  async updateStatus(
    id: string,
    status: 'pending' | 'succeeded' | 'failed',
    opts?: { lastError?: string; nextRetryAt?: Date; succeededAt?: Date; attempts?: number }
  ): Promise<void> {
    const updates: Record<string, unknown> = { status };
    if (opts?.['lastError'] !== undefined) updates['lastError'] = opts['lastError'];
    if (opts?.['nextRetryAt'] !== undefined) updates['nextRetryAt'] = opts['nextRetryAt'];
    if (opts?.['succeededAt'] !== undefined) updates['succeededAt'] = opts['succeededAt'];
    if (opts?.['attempts'] !== undefined) updates['attempts'] = opts['attempts'];

    await this.db
      .update(webhookDeliveries)
      .set(updates as Record<string, unknown>)
      .where(eq(webhookDeliveries.id, id));
  }

  private buildConditions(
    filters?: WebhookDeliveryFilters
  ): ReturnType<typeof eq>[] {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filters?.status) {
      conditions.push(eq(webhookDeliveries.status, filters.status));
    }
    if (filters?.subscriptionId) {
      conditions.push(
        eq(webhookDeliveries.subscriptionId, filters.subscriptionId)
      );
    }
    return conditions;
  }

  private mapRow(row: (typeof webhookDeliveries.$inferSelect)): WebhookDelivery {
    return {
      id: row.id,
      subscriptionId: row.subscriptionId,
      eventType: row.eventType,
      payload: row.payload as Record<string, unknown>,
      status: row.status as WebhookDelivery['status'],
      attempts: row.attempts,
      lastError: row.lastError,
      nextRetryAt: row.nextRetryAt,
      succeededAt: row.succeededAt,
      createdAt: row.createdAt,
    };
  }
}
