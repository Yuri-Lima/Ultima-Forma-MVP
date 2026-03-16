import { RegisterClaimDefinitionUseCase } from './register-claim-definition.use-case';
import type { ClaimRegistryRepositoryPort } from '@ultima-forma/domain-claims';

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

describe('RegisterClaimDefinitionUseCase', () => {
  let useCase: RegisterClaimDefinitionUseCase;
  let repo: jest.Mocked<ClaimRegistryRepositoryPort>;

  beforeEach(() => {
    repo = makeClaimRepo();
    useCase = new RegisterClaimDefinitionUseCase(repo);
  });

  it('should register a new claim definition', async () => {
    repo.findClaimByKey.mockResolvedValue(null);
    repo.createClaimDefinition.mockResolvedValue({
      id: 'def-1',
      key: 'email',
      namespace: 'identity',
      displayName: 'Email Address',
      description: null,
      sensitivityLevel: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await useCase.execute({
      key: 'email',
      namespace: 'identity',
      displayName: 'Email Address',
      sensitivityLevel: 'medium',
    });

    expect(result.key).toBe('email');
    expect(repo.createClaimDefinition).toHaveBeenCalled();
  });

  it('should reject duplicate claim key', async () => {
    repo.findClaimByKey.mockResolvedValue({
      id: 'def-1',
      key: 'email',
      namespace: 'identity',
      displayName: 'Email',
      description: null,
      sensitivityLevel: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      useCase.execute({
        key: 'email',
        namespace: 'identity',
        displayName: 'Email',
        sensitivityLevel: 'medium',
      })
    ).rejects.toThrow('already exists');
  });

  it('should create initial version when jsonSchema is provided', async () => {
    repo.findClaimByKey.mockResolvedValue(null);
    repo.createClaimDefinition.mockResolvedValue({
      id: 'def-1',
      key: 'phone',
      namespace: 'identity',
      displayName: 'Phone',
      description: null,
      sensitivityLevel: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repo.createClaimVersion.mockResolvedValue({
      id: 'ver-1',
      claimDefinitionId: 'def-1',
      version: 1,
      jsonSchema: { type: 'string' },
      status: 'active',
      createdAt: new Date(),
    });

    await useCase.execute({
      key: 'phone',
      namespace: 'identity',
      displayName: 'Phone',
      sensitivityLevel: 'high',
      jsonSchema: { type: 'string' },
    });

    expect(repo.createClaimVersion).toHaveBeenCalledWith(
      expect.objectContaining({ claimDefinitionId: 'def-1' })
    );
  });
});
