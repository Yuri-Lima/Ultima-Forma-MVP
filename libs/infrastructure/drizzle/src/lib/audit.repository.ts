import { and, eq, sql } from 'drizzle-orm';
import { AppError } from '@ultima-forma/shared-errors';
import type {
  AuditEvent,
  AuditEventFilters,
  AuditRepositoryPort,
  CreateAuditEventInput,
  PaginationOptions,
} from '@ultima-forma/domain-audit';
import { auditEvents } from './schema';
import type { DrizzleDB } from './drizzle.module';

export class AuditRepository implements AuditRepositoryPort {
  constructor(private readonly db: DrizzleDB) {}

  async append(input: CreateAuditEventInput): Promise<AuditEvent> {
    const [row] = await this.db
      .insert(auditEvents)
      .values({
        eventType: input.eventType,
        aggregateType: input.aggregateType,
        aggregateId: input.aggregateId,
        payload: input.payload,
      })
      .returning();

    if (!row) throw new AppError('AUDIT_APPEND_FAILED', 'Failed to append audit event', 500);

    return {
      id: row.id,
      eventType: row.eventType as AuditEvent['eventType'],
      aggregateType: row.aggregateType,
      aggregateId: row.aggregateId,
      payload: row.payload as Record<string, unknown>,
      createdAt: row.createdAt,
    };
  }

  async findMany(
    filters?: AuditEventFilters,
    pagination?: PaginationOptions
  ): Promise<AuditEvent[]> {
    const conditions = this.buildConditions(filters);
    let query = this.db.select().from(auditEvents).orderBy(auditEvents.createdAt);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const limit = pagination?.limit ?? 50;
    const offset = pagination?.offset ?? 0;

    const rows = await query.limit(limit).offset(offset);

    return rows.map((row) => ({
      id: row.id,
      eventType: row.eventType as AuditEvent['eventType'],
      aggregateType: row.aggregateType,
      aggregateId: row.aggregateId,
      payload: row.payload as Record<string, unknown>,
      createdAt: row.createdAt,
    }));
  }

  async count(filters?: AuditEventFilters): Promise<number> {
    const conditions = this.buildConditions(filters);
    let query = this.db.select({ count: sql<number>`count(*)::int` }).from(auditEvents);

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as typeof query;
    }

    const [result] = await query;
    return result?.count ?? 0;
  }

  private buildConditions(filters?: AuditEventFilters): ReturnType<typeof eq>[] {
    const conditions: ReturnType<typeof eq>[] = [];
    if (filters?.eventType) {
      conditions.push(eq(auditEvents.eventType, filters.eventType));
    }
    if (filters?.aggregateId) {
      conditions.push(eq(auditEvents.aggregateId, filters.aggregateId));
    }
    return conditions;
  }
}
