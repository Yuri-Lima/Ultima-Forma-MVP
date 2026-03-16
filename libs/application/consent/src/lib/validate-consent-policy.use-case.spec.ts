import { ValidateConsentPolicyUseCase } from './validate-consent-policy.use-case';
import type { ConsentPolicyRepositoryPort } from '@ultima-forma/domain-consent';

function makePolicy(
  overrides: Partial<{
    maxDurationHours: number;
    allowedClaims: string[];
  }> = {}
) {
  return {
    id: 'policy-1',
    tenantId: 'tenant-1',
    name: 'Default Policy',
    maxDurationHours: 720,
    allowedClaims: ['email', 'name', 'phone'],
    jurisdiction: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('ValidateConsentPolicyUseCase', () => {
  let useCase: ValidateConsentPolicyUseCase;
  let policyRepo: jest.Mocked<ConsentPolicyRepositoryPort>;

  beforeEach(() => {
    policyRepo = {
      findPolicyByTenantId: jest.fn(),
      findPolicyById: jest.fn(),
      createPolicy: jest.fn(),
    };
    useCase = new ValidateConsentPolicyUseCase(policyRepo);
  });

  it('should pass when no policy exists (fallback)', async () => {
    policyRepo.findPolicyByTenantId.mockResolvedValue(null);

    const result = await useCase.execute({
      tenantId: 'tenant-1',
      claims: ['email', 'ssn'],
      durationHours: 9999,
    });

    expect(result.valid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('should pass when claims and duration within policy', async () => {
    policyRepo.findPolicyByTenantId.mockResolvedValue(makePolicy());

    const result = await useCase.execute({
      tenantId: 'tenant-1',
      claims: ['email', 'name'],
      durationHours: 48,
    });

    expect(result.valid).toBe(true);
  });

  it('should fail when duration exceeds policy max', async () => {
    policyRepo.findPolicyByTenantId.mockResolvedValue(
      makePolicy({ maxDurationHours: 24 })
    );

    const result = await useCase.execute({
      tenantId: 'tenant-1',
      claims: ['email'],
      durationHours: 48,
    });

    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain('exceeds policy max');
  });

  it('should fail when claims are not allowed by policy', async () => {
    policyRepo.findPolicyByTenantId.mockResolvedValue(
      makePolicy({ allowedClaims: ['email'] })
    );

    const result = await useCase.execute({
      tenantId: 'tenant-1',
      claims: ['email', 'ssn'],
      durationHours: 1,
    });

    expect(result.valid).toBe(false);
    expect(result.violations[0]).toContain('ssn');
  });

  it('should allow any claims when allowedClaims is empty', async () => {
    policyRepo.findPolicyByTenantId.mockResolvedValue(
      makePolicy({ allowedClaims: [] })
    );

    const result = await useCase.execute({
      tenantId: 'tenant-1',
      claims: ['anything', 'goes'],
      durationHours: 1,
    });

    expect(result.valid).toBe(true);
  });
});
