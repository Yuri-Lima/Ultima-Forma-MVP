import { AppError } from '@ultima-forma/shared-errors';
import type { ConsentPolicyRepositoryPort } from '@ultima-forma/domain-consent';

export interface ValidateConsentPolicyInput {
  tenantId: string;
  claims: string[];
  durationHours: number;
}

export interface ValidateConsentPolicyResult {
  valid: boolean;
  violations: string[];
}

export class ValidateConsentPolicyUseCase {
  constructor(private readonly policyRepo: ConsentPolicyRepositoryPort) {}

  async execute(
    input: ValidateConsentPolicyInput
  ): Promise<ValidateConsentPolicyResult> {
    const policy = await this.policyRepo.findPolicyByTenantId(input.tenantId);

    if (!policy) {
      return { valid: true, violations: [] };
    }

    const violations: string[] = [];

    if (input.durationHours > policy.maxDurationHours) {
      violations.push(
        `Duration ${input.durationHours}h exceeds policy max ${policy.maxDurationHours}h`
      );
    }

    if (policy.allowedClaims.length > 0) {
      const disallowed = input.claims.filter(
        (c) => !policy.allowedClaims.includes(c)
      );
      if (disallowed.length > 0) {
        violations.push(
          `Claims not allowed by policy: ${disallowed.join(', ')}`
        );
      }
    }

    return { valid: violations.length === 0, violations };
  }
}
