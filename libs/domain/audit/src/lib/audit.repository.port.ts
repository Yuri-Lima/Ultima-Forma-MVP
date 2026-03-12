import type { AuditEvent, BillableEvent } from './audit.types';
import type { CreateAuditEventInput, CreateBillableEventInput } from './audit.types';

export interface AuditEventFilters {
  eventType?: string;
  aggregateId?: string;
}

export interface BillableEventFilters {
  eventType?: string;
  dataRequestId?: string;
  tenantId?: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

export interface AuditRepositoryPort {
  append(input: CreateAuditEventInput): Promise<AuditEvent>;
  findMany(filters?: AuditEventFilters, pagination?: PaginationOptions): Promise<AuditEvent[]>;
  count(filters?: AuditEventFilters): Promise<number>;
}

export interface BillableEventRepositoryPort {
  append(input: CreateBillableEventInput): Promise<BillableEvent>;
  findMany(
    filters?: BillableEventFilters,
    pagination?: PaginationOptions
  ): Promise<BillableEvent[]>;
  count(filters?: BillableEventFilters): Promise<number>;
}
