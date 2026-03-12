import { and, eq, sql } from 'drizzle-orm';
import { AppError } from '@ultima-forma/shared-errors';
import type {
  BillableEvent,
  BillableEventFilters,
  BillableEventRepositoryPort,
  CreateBillableEventInput,
  PaginationOptions,
} from '@ultima-forma/domain-audit';
import { billableEvents } from './schema';
import type { DrizzleDB } from './drizzle.module';

export class BillableEventRepository implements BillableEventRepositoryPort {
  constructor(private readonly db: DrizzleDB) {}

  async append(input: CreateBillableEventInput): Promise<BillableEvent> {
    const [row] = await this.db
      .insert(billableEvents)
      .values({
        eventType: input.eventType,
        dataRequestId: input.dataRequestId,
        tenantId: input.tenantId,
        payload: input.payload,
      })
      .returning();

    if (!row) throw new AppError('BILLABLE_APPEND_FAILED', 'Failed to append billable event', 500);

    return {
      id: row.id,
      eventType: row.eventType as BillableEvent['eventType'],
      dataRequestId: row.dataRequestId,
      tenantId: row.tenantId,
      payload: row.payload as Record<string, unknown>,
      createdAt: row.createdAt,
    };
  }

  async findMany(
    filters?: BillableEventFilters,
    pagination?: PaginationOptions
  ): Promise<BillableEvent[]> {
    const conditions = this.buildConditions(filters);
    let query = this.db
      .select()
      .from(billableEvents)
      .orderBy(billableEvents.createdAt);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const limit = pagination?.limit ?? 50;
    const offset = pagination?.offset ?? 0;

    const rows = await query.limit(limit).offset(offset);

    return rows.map((row) => ({
      id: row.id,
      eventType: row.eventType as BillableEvent['eventType'],
      dataRequestId: row.dataRequestId,
      tenantId: row.tenantId,
      payload: row.payload as Record<string, unknown>,
      createdAt: row.createdAt,
    }));
  }

  async count(filters?: BillableEventFilters): Promise<number> {
    const conditions = this.buildConditions(filters);
    let query = this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(billableEvents);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const [result] = await query;
    return result?.count ?? 0;
  }

  private buildConditions(
    filters?: BillableEventFilters
  ): ReturnType<typeof eq>[] {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filters?.eventType) {
      conditions.push(eq(billableEvents.eventType, filters.eventType));
    }
    if (filters?.dataRequestId) {
      conditions.push(eq(billableEvents.dataRequestId, filters.dataRequestId));
    }
    if (filters?.tenantId) {
      conditions.push(eq(billableEvents.tenantId, filters.tenantId));
    }
    return conditions;
  }
}
