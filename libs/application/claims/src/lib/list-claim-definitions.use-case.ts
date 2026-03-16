import type {
  ClaimDefinition,
  ClaimRegistryRepositoryPort,
  ListClaimsFilters,
} from '@ultima-forma/domain-claims';

export class ListClaimDefinitionsUseCase {
  constructor(private readonly claimRepo: ClaimRegistryRepositoryPort) {}

  async execute(filters?: ListClaimsFilters): Promise<ClaimDefinition[]> {
    return this.claimRepo.listClaims(filters);
  }
}
