import { AppError } from '@ultima-forma/shared-errors';
import type {
  ClaimDefinition,
  ClaimRegistryRepositoryPort,
  CreateClaimDefinitionInput,
} from '@ultima-forma/domain-claims';

export class RegisterClaimDefinitionUseCase {
  constructor(private readonly claimRepo: ClaimRegistryRepositoryPort) {}

  async execute(input: CreateClaimDefinitionInput): Promise<ClaimDefinition> {
    const existing = await this.claimRepo.findClaimByKey(input.key);
    if (existing) {
      throw new AppError(
        'CLAIM_KEY_ALREADY_EXISTS',
        `Claim key "${input.key}" already exists`,
        409
      );
    }

    const definition = await this.claimRepo.createClaimDefinition(input);

    if (input.jsonSchema) {
      await this.claimRepo.createClaimVersion({
        claimDefinitionId: definition.id,
        jsonSchema: input.jsonSchema,
      });
    }

    return definition;
  }
}
