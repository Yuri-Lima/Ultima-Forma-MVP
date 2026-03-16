import type {
  AssignClaimPermissionInput,
  ClaimDefinition,
  ClaimDefinitionVersion,
  ClaimPermission,
  CreateClaimDefinitionInput,
  CreateClaimVersionInput,
  ListClaimsFilters,
} from './claims.types';

export interface ClaimRegistryRepositoryPort {
  findClaimByKey(key: string): Promise<ClaimDefinition | null>;
  findClaimById(id: string): Promise<ClaimDefinition | null>;
  listClaims(
    filters?: ListClaimsFilters
  ): Promise<ClaimDefinition[]>;
  createClaimDefinition(
    input: CreateClaimDefinitionInput
  ): Promise<ClaimDefinition>;
  createClaimVersion(
    input: CreateClaimVersionInput
  ): Promise<ClaimDefinitionVersion>;
  findLatestVersion(
    claimDefinitionId: string
  ): Promise<ClaimDefinitionVersion | null>;
  assignPermission(
    input: AssignClaimPermissionInput
  ): Promise<ClaimPermission>;
  findPermissions(
    partnerId: string,
    claimDefinitionIds: string[]
  ): Promise<ClaimPermission[]>;
  findClaimsByKeys(keys: string[]): Promise<ClaimDefinition[]>;
}
