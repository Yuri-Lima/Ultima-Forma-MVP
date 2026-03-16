export type CredentialReferenceStatus = 'active' | 'revoked' | 'expired';
export type PresentationSessionStatus = 'pending' | 'in_progress' | 'completed' | 'failed';

export interface UserSubject {
  id: string;
  tenantId: string;
  externalSubjectRef: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CredentialReference {
  id: string;
  userSubjectId: string;
  issuerId: string;
  claimDefinitionId: string | null;
  externalCredentialRef: string;
  status: CredentialReferenceStatus;
  issuedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export interface PresentationSession {
  id: string;
  dataRequestId: string;
  userSubjectId: string;
  status: PresentationSessionStatus;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export interface CreateUserSubjectInput {
  tenantId: string;
  externalSubjectRef: string;
}

export interface CreateCredentialReferenceInput {
  userSubjectId: string;
  issuerId: string;
  claimDefinitionId?: string;
  externalCredentialRef: string;
  issuedAt?: Date;
  expiresAt?: Date;
}

export interface CreatePresentationSessionInput {
  dataRequestId: string;
  userSubjectId: string;
}
