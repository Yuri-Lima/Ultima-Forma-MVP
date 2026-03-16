import { ValidateClaimsAgainstRegistryUseCase } from './validate-claims-against-registry.use-case';
import type { ClaimRegistryRepositoryPort } from '@ultima-forma/domain-consent';

function makeClaimRepo(): jest.Mocked<ClaimRegistryRepositoryPort> {
  return {
    findClaimByKey: jest.fn(),
    findClaimById: jest.fn(),
    listClaims: jest.fn(),
    createClaimDefinition: jest.fn(),
    createClaimVersion: jest.fn(),
    findLatestVersion: jest.fn(),
    assignPermission: jest.fn(),
    findPermissions: jest.fn(),
    findClaimsByKeys: jest.fn(),
  };
}

describe('ValidateClaimsAgainstRegistryUseCase', () => {
  let useCase: ValidateClaimsAgainstRegistryUseCase;
  let repo: jest.Mocked<ClaimRegistryRepositoryPort>;

  beforeEach(() => {
    repo = makeClaimRepo();
    useCase = new ValidateClaimsAgainstRegistryUseCase(repo);
  });

  it('should pass for empty claims list', async () => {
    await expect(
      useCase.execute({ claims: [], consumerId: 'c1', partnerId: 'p1' })
    ).resolves.toBeUndefined();
  });

  it('should reject unknown claims', async () => {
    repo.findClaimsByKeys.mockResolvedValue([]);

    await expect(
      useCase.execute({
        claims: ['ssn'],
        consumerId: 'c1',
        partnerId: 'p1',
      })
    ).rejects.toThrow('Unknown claims: ssn');
  });

  it('should reject unauthorized claims', async () => {
    repo.findClaimsByKeys.mockResolvedValue([
      {
        id: 'def-1',
        key: 'email',
        namespace: 'identity',
        displayName: 'Email',
        description: null,
        sensitivityLevel: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    repo.findPermissions.mockResolvedValue([]);

    await expect(
      useCase.execute({
        claims: ['email'],
        consumerId: 'c1',
        partnerId: 'p1',
      })
    ).rejects.toThrow('not authorized');
  });

  it('should pass for valid and authorized claims', async () => {
    repo.findClaimsByKeys.mockResolvedValue([
      {
        id: 'def-1',
        key: 'email',
        namespace: 'identity',
        displayName: 'Email',
        description: null,
        sensitivityLevel: 'medium',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
    repo.findPermissions.mockResolvedValue([
      {
        id: 'perm-1',
        partnerId: 'p1',
        claimDefinitionId: 'def-1',
        permissionType: 'consume',
        createdAt: new Date(),
      },
    ]);

    await expect(
      useCase.execute({
        claims: ['email'],
        consumerId: 'c1',
        partnerId: 'p1',
      })
    ).resolves.toBeUndefined();
  });
});
