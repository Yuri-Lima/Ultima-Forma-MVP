export type RequestStatus = 'pending' | 'expired' | 'completed' | 'rejected';

export type ConsentStatus = 'pending' | 'approved' | 'rejected';

export type TrustLevel = 'low' | 'medium' | 'high' | 'verified';

export interface VerificationResult {
  trustLevel: TrustLevel;
  verifiedAt: Date;
  verifiedClaims?: string[];
}

export interface ReceiptData {
  approved: boolean;
  timestamp: string;
  requestId: string;
  consentId: string;
  trustLevel: TrustLevel;
  verificationResult?: VerificationResult;
}

export interface DataRequest {
  id: string;
  consumerId: string;
  tenantId: string;
  status: RequestStatus;
  purpose: string;
  expiresAt: Date;
  idempotencyKey: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RequestItem {
  id: string;
  dataRequestId: string;
  claim: string;
  createdAt: Date;
}

export interface Consent {
  id: string;
  dataRequestId: string;
  status: ConsentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsentReceipt {
  id: string;
  consentId: string;
  approved: boolean;
  receiptData: Record<string, unknown>;
  createdAt: Date;
}

export interface DataRequestResultForConsumer {
  requestId: string;
  status: RequestStatus;
  consumerId: string;
  consumerName: string;
  purpose: string;
  claims: string[];
  expiresAt: Date;
  createdAt: Date;
  receipt?: {
    id: string;
    approved: boolean;
    trustLevel: TrustLevel;
    verificationResult?: VerificationResult;
  };
}

export interface DataRequestListItem extends DataRequest {
  consumerName: string;
}

export interface ListDataRequestsFilters {
  status?: RequestStatus;
  tenantId?: string;
}

export interface ListDataRequestsPagination {
  limit?: number;
  offset?: number;
}
