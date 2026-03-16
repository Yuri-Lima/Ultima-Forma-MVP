import { CompletePresentationSessionUseCase } from './complete-presentation-session.use-case';
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

describe('CompletePresentationSessionUseCase', () => {
  let useCase: CompletePresentationSessionUseCase;
  let repo: jest.Mocked<WalletRepositoryPort>;

  beforeEach(() => {
    repo = makeWalletRepo();
    useCase = new CompletePresentationSessionUseCase(repo);
  });

  it('should complete a pending session', async () => {
    const session = {
      id: 'sess-1',
      dataRequestId: 'dr-1',
      userSubjectId: 'sub-1',
      status: 'pending' as const,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
    };
    const completed = { ...session, status: 'completed' as const, completedAt: new Date() };
    repo.findPresentationSessionById.mockResolvedValue(session);
    repo.completePresentationSession.mockResolvedValue(completed);

    const result = await useCase.execute('sess-1');

    expect(result.status).toBe('completed');
    expect(repo.completePresentationSession).toHaveBeenCalledWith('sess-1');
  });

  it('should reject if session not found', async () => {
    repo.findPresentationSessionById.mockResolvedValue(null);

    await expect(useCase.execute('missing')).rejects.toThrow(
      'Presentation session not found'
    );
  });

  it('should reject already completed session', async () => {
    repo.findPresentationSessionById.mockResolvedValue({
      id: 'sess-1',
      dataRequestId: 'dr-1',
      userSubjectId: 'sub-1',
      status: 'completed',
      startedAt: null,
      completedAt: new Date(),
      createdAt: new Date(),
    });

    await expect(useCase.execute('sess-1')).rejects.toThrow(
      'already completed'
    );
  });
});
