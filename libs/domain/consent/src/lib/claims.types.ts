export type SensitivityLevel = 'low' | 'medium' | 'high' | 'critical';

export type ClaimDefinitionStatus = 'active' | 'deprecated';

export type ClaimPermissionType = 'issue' | 'consume' | 'both';

export interface ClaimDefinition {
  id: string;
  key: string;
  namespace: string;
  displayName: string;
  description: string | null;
  sensitivityLevel: SensitivityLevel;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClaimDefinitionVersion {
  id: string;
  claimDefinitionId: string;
  version: number;
  jsonSchema: Record<string, unknown>;
  status: ClaimDefinitionStatus;
  createdAt: Date;
}

export interface ClaimPermission {
  id: string;
  partnerId: string;
  claimDefinitionId: string;
  permissionType: ClaimPermissionType;
  createdAt: Date;
}

export interface CreateClaimDefinitionInput {
  key: string;
  namespace: string;
  displayName: string;
  description?: string;
  sensitivityLevel: SensitivityLevel;
  jsonSchema?: Record<string, unknown>;
}

export interface CreateClaimVersionInput {
  claimDefinitionId: string;
  jsonSchema: Record<string, unknown>;
}

export interface AssignClaimPermissionInput {
  partnerId: string;
  claimDefinitionId: string;
  permissionType: ClaimPermissionType;
}

export interface ListClaimsFilters {
  namespace?: string;
  sensitivityLevel?: SensitivityLevel;
}
