import type { ConsentPolicy, CreateConsentPolicyInput } from './consent.types';

export interface ConsentPolicyRepositoryPort {
  findPolicyByTenantId(tenantId: string): Promise<ConsentPolicy | null>;
  findPolicyById(id: string): Promise<ConsentPolicy | null>;
  createPolicy(input: CreateConsentPolicyInput): Promise<ConsentPolicy>;
}
