import { RegisterUserSubjectUseCase } from './register-user-subject.use-case';
import { RegisterCredentialReferenceUseCase } from './register-credential-reference.use-case';
import { CreatePresentationSessionUseCase } from './create-presentation-session.use-case';
import { CompletePresentationSessionUseCase } from './complete-presentation-session.use-case';
import type {
  WalletRepositoryPort,
  ConsentRepositoryPort,
} from '@ultima-forma/domain-consent';

function makeWalletRepo(): jest.Mocked<WalletRepositoryPort> {
  return {
    createUserSubject: jest.fn(),
    findUserSubjectById: jest.fn(),
    createCredentialReference: jest.fn(),
    listCredentialsBySubject: jest.fn(),
    createPresentationSession: jest.fn(),
    findPresentationSessionById: jest.fn(),
    completePresentationSession: jest.fn(),
  };
}

function makeConsentRepo(): jest.Mocked<ConsentRepositoryPort> {
  return {
    createDataRequest: jest.fn(),
    findDataRequestById: jest.fn(),
    findDataRequestForUser: jest.fn(),
    findConsentById: jest.fn(),
    findConsentByRequestId: jest.fn(),
    approveConsent: jest.fn(),
    rejectConsent: jest.fn(),
    expireRequest: jest.fn(),
    findByIdempotencyKey: jest.fn(),
    findDataRequestResultForConsumer: jest.fn(),
    listDataRequests: jest.fn(),
    revokeConsent: jest.fn(),
    listConsentsByTenant: jest.fn(),
  };
}

describe('RegisterUserSubjectUseCase', () => {
  it('should register a user subject', async () => {
    const repo = makeWalletRepo();
    repo.createUserSubject.mockResolvedValue({
      id: 'sub-1',
      tenantId: 't1',
      externalSubjectRef: 'ext-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const uc = new RegisterUserSubjectUseCase(repo);
    const result = await uc.execute({
      tenantId: 't1',
      externalSubjectRef: 'ext-123',
    });
    expect(result.id).toBe('sub-1');
  });
});

describe('RegisterCredentialReferenceUseCase', () => {
  it('should register a credential reference', async () => {
    const repo = makeWalletRepo();
    repo.findUserSubjectById.mockResolvedValue({
      id: 'sub-1',
      tenantId: 't1',
      externalSubjectRef: 'ext-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    repo.createCredentialReference.mockResolvedValue({
      id: 'cred-1',
      userSubjectId: 'sub-1',
      issuerId: 'iss-1',
      claimDefinitionId: null,
      externalCredentialRef: 'ext-cred',
      status: 'active',
      issuedAt: null,
      expiresAt: null,
      createdAt: new Date(),
    });
    const uc = new RegisterCredentialReferenceUseCase(repo);
    const result = await uc.execute({
      userSubjectId: 'sub-1',
      issuerId: 'iss-1',
      externalCredentialRef: 'ext-cred',
    });
    expect(result.id).toBe('cred-1');
  });

  it('should throw when subject not found', async () => {
    const repo = makeWalletRepo();
    repo.findUserSubjectById.mockResolvedValue(null);
    const uc = new RegisterCredentialReferenceUseCase(repo);
    await expect(
      uc.execute({
        userSubjectId: 'nope',
        issuerId: 'iss-1',
        externalCredentialRef: 'ext-cred',
      })
    ).rejects.toThrow('User subject not found');
  });
});

describe('CreatePresentationSessionUseCase', () => {
  it('should create session', async () => {
    const walletRepo = makeWalletRepo();
    const consentRepo = makeConsentRepo();
    consentRepo.findDataRequestById.mockResolvedValue({
      id: 'req-1',
      consumerId: 'c1',
      tenantId: 't1',
      status: 'pending',
      purpose: 'test',
      expiresAt: new Date(),
      idempotencyKey: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    walletRepo.findUserSubjectById.mockResolvedValue({
      id: 'sub-1',
      tenantId: 't1',
      externalSubjectRef: 'ext',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    walletRepo.createPresentationSession.mockResolvedValue({
      id: 'sess-1',
      dataRequestId: 'req-1',
      userSubjectId: 'sub-1',
      status: 'pending',
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
    });
    const uc = new CreatePresentationSessionUseCase(walletRepo, consentRepo);
    const result = await uc.execute({
      dataRequestId: 'req-1',
      userSubjectId: 'sub-1',
    });
    expect(result.id).toBe('sess-1');
  });
});

describe('CompletePresentationSessionUseCase', () => {
  it('should complete session', async () => {
    const repo = makeWalletRepo();
    repo.findPresentationSessionById.mockResolvedValue({
      id: 'sess-1',
      dataRequestId: 'req-1',
      userSubjectId: 'sub-1',
      status: 'pending',
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
    });
    repo.completePresentationSession.mockResolvedValue({
      id: 'sess-1',
      dataRequestId: 'req-1',
      userSubjectId: 'sub-1',
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      createdAt: new Date(),
    });
    const uc = new CompletePresentationSessionUseCase(repo);
    const result = await uc.execute('sess-1');
    expect(result.status).toBe('completed');
  });

  it('should reject already completed session', async () => {
    const repo = makeWalletRepo();
    repo.findPresentationSessionById.mockResolvedValue({
      id: 'sess-1',
      dataRequestId: 'req-1',
      userSubjectId: 'sub-1',
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      createdAt: new Date(),
    });
    const uc = new CompletePresentationSessionUseCase(repo);
    await expect(uc.execute('sess-1')).rejects.toThrow('already completed');
  });
});
