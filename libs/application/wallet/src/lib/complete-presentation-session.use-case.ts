import { AppError } from '@ultima-forma/shared-errors';
import type {
  PresentationSession,
  WalletRepositoryPort,
} from '@ultima-forma/domain-wallet';

export class CompletePresentationSessionUseCase {
  constructor(private readonly walletRepo: WalletRepositoryPort) {}

  async execute(sessionId: string): Promise<PresentationSession> {
    const session = await this.walletRepo.findPresentationSessionById(
      sessionId
    );
    if (!session) {
      throw new AppError(
        'PRESENTATION_SESSION_NOT_FOUND',
        'Presentation session not found',
        404
      );
    }
    if (session.status === 'completed') {
      throw new AppError(
        'SESSION_ALREADY_COMPLETED',
        'Presentation session is already completed',
        400
      );
    }
    return this.walletRepo.completePresentationSession(sessionId);
  }
}
