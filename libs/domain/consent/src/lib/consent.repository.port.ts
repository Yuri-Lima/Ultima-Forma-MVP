import type {
  Consent,
  ConsentReceipt,
  DataRequest,
  DataRequestResultForConsumer,
  RequestItem,
} from './consent.types';

export interface CreateDataRequestInput {
  consumerId: string;
  tenantId: string;
  purpose: string;
  claims: string[];
  expiresAt: Date;
  idempotencyKey?: string;
}

export interface DataRequestWithDetails {
  request: DataRequest;
  items: RequestItem[];
  consent: Consent;
  consumerName: string;
}

export interface ConsentRepositoryPort {
  createDataRequest(input: CreateDataRequestInput): Promise<DataRequest>;
  findDataRequestById(id: string): Promise<DataRequest | null>;
  findDataRequestForUser(id: string): Promise<DataRequestWithDetails | null>;
  findConsentById(id: string): Promise<Consent | null>;
  findConsentByRequestId(requestId: string): Promise<Consent | null>;
  approveConsent(consentId: string): Promise<ConsentReceipt>;
  rejectConsent(consentId: string): Promise<ConsentReceipt>;
  expireRequest(requestId: string): Promise<DataRequest>;
  findByIdempotencyKey(key: string): Promise<DataRequest | null>;
  findDataRequestResultForConsumer(
    requestId: string
  ): Promise<DataRequestResultForConsumer | null>;
}
