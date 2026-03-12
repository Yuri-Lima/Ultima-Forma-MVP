import type { Consumer, Issuer, Partner } from './partner.types';

export interface CreateIssuerInput {
  partnerId: string;
  tenantId: string;
  name: string;
  scopes?: string[];
}

export interface CreateConsumerInput {
  partnerId: string;
  tenantId: string;
  name: string;
  scopes?: string[];
}

export interface RotateCredentialResult {
  credentialId: string;
  secret: string;
  secretHash: string;
}

export interface UpdateIssuerInput {
  name?: string;
  status?: string;
  scopes?: string[];
}

export interface UpdateConsumerInput {
  name?: string;
  status?: string;
  scopes?: string[];
}

export interface PartnerRepositoryPort {
  findPartnerById(id: string): Promise<Partner | null>;
  findIssuerById(id: string): Promise<Issuer | null>;
  findConsumerById(id: string): Promise<Consumer | null>;
  createIssuer(input: CreateIssuerInput): Promise<Issuer>;
  createConsumer(input: CreateConsumerInput): Promise<Consumer>;
  updateIssuer(id: string, input: UpdateIssuerInput): Promise<Issuer>;
  updateConsumer(id: string, input: UpdateConsumerInput): Promise<Consumer>;
  rotateIntegrationCredential(partnerId: string): Promise<RotateCredentialResult>;
}
