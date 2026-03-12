export type AuditEventType =
  | 'request_created'
  | 'consent_granted'
  | 'consent_rejected'
  | 'request_expired';

export type BillableEventType = 'consent_granted';

export interface AuditEvent {
  id: string;
  eventType: AuditEventType;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export interface BillableEvent {
  id: string;
  eventType: BillableEventType;
  dataRequestId: string;
  tenantId: string;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export interface CreateAuditEventInput {
  eventType: AuditEventType;
  aggregateType: string;
  aggregateId: string;
  payload: Record<string, unknown>;
}

export interface CreateBillableEventInput {
  eventType: BillableEventType;
  dataRequestId: string;
  tenantId: string;
  payload: Record<string, unknown>;
}
