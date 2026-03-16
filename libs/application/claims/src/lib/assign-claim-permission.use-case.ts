import { AppError } from '@ultima-forma/shared-errors';
import type {
  AssignClaimPermissionInput,
  ClaimPermission,
  ClaimRegistryRepositoryPort,
} from '@ultima-forma/domain-claims';

export class AssignClaimPermissionUseCase {
  constructor(private readonly claimRepo: ClaimRegistryRepositoryPort) {}

  async execute(input: AssignClaimPermissionInput): Promise<ClaimPermission> {
    const definition = await this.claimRepo.findClaimById(input.claimDefinitionId);
    if (!definition) {
      throw new AppError(
        'CLAIM_NOT_FOUND',
        'Claim definition not found',
        404
      );
    }

    return this.claimRepo.assignPermission(input);
  }
}
