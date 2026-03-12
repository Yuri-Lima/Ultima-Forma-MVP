import { and, eq } from 'drizzle-orm';
import { AppError } from '@ultima-forma/shared-errors';
import type {
  CreateWebhookSubscriptionInput,
  WebhookSubscription,
  WebhookSubscriptionRepositoryPort,
} from '@ultima-forma/domain-webhook';
import { webhookSubscriptions } from './schema';
import type { DrizzleDB } from './drizzle.module';

export class WebhookSubscriptionRepository implements WebhookSubscriptionRepositoryPort {
  constructor(private readonly db: DrizzleDB) {}

  async findById(id: string): Promise<WebhookSubscription | null> {
    const rows = await this.db
      .select()
      .from(webhookSubscriptions)
      .where(eq(webhookSubscriptions.id, id))
      .limit(1);
    const row = rows[0];
    if (!row) return null;
    return this.mapRow(row);
  }

  async create(input: CreateWebhookSubscriptionInput): Promise<WebhookSubscription> {
    const [row] = await this.db
      .insert(webhookSubscriptions)
      .values({
        partnerId: input.partnerId,
        url: input.url,
        secret: input.secret ?? null,
        eventTypes: input.eventTypes ?? [],
      })
      .returning();

    if (!row) throw new AppError('WEBHOOK_SUBSCRIPTION_CREATE_FAILED', 'Failed to create webhook subscription', 500);

    return this.mapRow(row);
  }

  async findByPartnerId(partnerId: string): Promise<WebhookSubscription[]> {
    const rows = await this.db
      .select()
      .from(webhookSubscriptions)
      .where(eq(webhookSubscriptions.partnerId, partnerId));

    return rows.map(this.mapRow);
  }

  async findActiveByEventType(eventType: string): Promise<WebhookSubscription[]> {
    const rows = await this.db
      .select()
      .from(webhookSubscriptions)
      .where(eq(webhookSubscriptions.status, 'active'));

    return rows
      .filter((r) => (r.eventTypes as string[])?.includes(eventType))
      .map((r) => this.mapRow(r));
  }

  async findActiveByPartnerAndEventType(
    partnerId: string,
    eventType: string
  ): Promise<WebhookSubscription[]> {
    const rows = await this.db
      .select()
      .from(webhookSubscriptions)
      .where(
        and(
          eq(webhookSubscriptions.partnerId, partnerId),
          eq(webhookSubscriptions.status, 'active')
        )
      );

    return rows
      .filter((r) => (r.eventTypes as string[])?.includes(eventType))
      .map((r) => this.mapRow(r));
  }

  private mapRow(row: (typeof webhookSubscriptions.$inferSelect)): WebhookSubscription {
    return {
      id: row.id,
      partnerId: row.partnerId,
      url: row.url,
      secret: row.secret,
      eventTypes: (row.eventTypes as string[]) ?? [],
      status: row.status as WebhookSubscription['status'],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };
  }
}
