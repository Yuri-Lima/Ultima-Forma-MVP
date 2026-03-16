import { ResolveSubjectUseCase } from './resolve-subject.use-case';
import type { WalletRepositoryPort } from '@ultima-forma/domain-wallet';

function makeWalletRepo(): jest.Mocked<WalletRepositoryPort> {
  return {
    createUserSubject: jest.fn(),
    findUserSubjectById: jest.fn(),
    findByTenantAndExternalRef: jest.fn(),
    createCredentialReference: jest.fn(),
    listCredentialsBySubject: jest.fn(),
    createPresentationSession: jest.fn(),
    findPresentationSessionById: jest.fn(),
    completePresentationSession: jest.fn(),
  };
}

describe('ResolveSubjectUseCase', () => {
  let useCase: ResolveSubjectUseCase;
  let repo: jest.Mocked<WalletRepositoryPort>;

  beforeEach(() => {
    repo = makeWalletRepo();
    useCase = new ResolveSubjectUseCase(repo);
  });

  it('should return existing subject when found', async () => {
    const existing = {
      id: 'sub-1',
      tenantId: 't1',
      externalSubjectRef: 'ext-ref',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repo.findByTenantAndExternalRef.mockResolvedValue(existing);

    const result = await useCase.execute({
      tenantId: 't1',
      externalSubjectRef: 'ext-ref',
    });

    expect(result).toEqual(existing);
    expect(repo.createUserSubject).not.toHaveBeenCalled();
  });

  it('should create new subject when not found', async () => {
    const created = {
      id: 'sub-2',
      tenantId: 't1',
      externalSubjectRef: 'new-ref',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    repo.findByTenantAndExternalRef.mockResolvedValue(null);
    repo.createUserSubject.mockResolvedValue(created);

    const result = await useCase.execute({
      tenantId: 't1',
      externalSubjectRef: 'new-ref',
    });

    expect(result).toEqual(created);
    expect(repo.createUserSubject).toHaveBeenCalledWith({
      tenantId: 't1',
      externalSubjectRef: 'new-ref',
    });
  });
});
