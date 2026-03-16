import { AppError } from '@ultima-forma/shared-errors';
import type { ClaimRegistryRepositoryPort } from '@ultima-forma/domain-claims';

export interface ValidateClaimsInput {
  claims: string[];
  consumerId: string;
  partnerId: string;
}

export class ValidateClaimsAgainstRegistryUseCase {
  constructor(private readonly claimRepo: ClaimRegistryRepositoryPort) {}

  async execute(input: ValidateClaimsInput): Promise<void> {
    if (input.claims.length === 0) return;

    const definitions = await this.claimRepo.findClaimsByKeys(input.claims);
    const foundKeys = new Set(definitions.map((d) => d.key));

    const missing = input.claims.filter((c) => !foundKeys.has(c));
    if (missing.length > 0) {
      throw new AppError(
        'CLAIMS_NOT_FOUND',
        `Unknown claims: ${missing.join(', ')}`,
        400
      );
    }

    const claimDefIds = definitions.map((d) => d.id);
    const permissions = await this.claimRepo.findPermissions(
      input.partnerId,
      claimDefIds
    );
    const permittedIds = new Set(permissions.map((p) => p.claimDefinitionId));

    const unauthorized = definitions.filter((d) => !permittedIds.has(d.id));
    if (unauthorized.length > 0) {
      throw new AppError(
        'CLAIMS_NOT_AUTHORIZED',
        `Partner not authorized for claims: ${unauthorized.map((d) => d.key).join(', ')}`,
        403
      );
    }
  }
}
