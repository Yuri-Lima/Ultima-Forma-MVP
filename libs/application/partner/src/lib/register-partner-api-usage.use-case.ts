import { logger } from '@ultima-forma/shared-logger';
import type {
  PartnerSecurityRepositoryPort,
  RecordApiUsageInput,
} from '@ultima-forma/domain-partner';

export class RegisterPartnerApiUsageUseCase {
  constructor(
    private readonly securityRepo: PartnerSecurityRepositoryPort
  ) {}

  async execute(input: RecordApiUsageInput): Promise<void> {
    try {
      await this.securityRepo.recordApiUsage(input);
    } catch (err) {
      logger.error('Failed to record partner API usage', {
        partnerId: input.partnerId,
        route: input.route,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }
}
