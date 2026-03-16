import { AppError } from '@ultima-forma/shared-errors';
import type {
  ConsentRepositoryPort,
  CreatePresentationSessionInput,
  PresentationSession,
  WalletRepositoryPort,
} from '@ultima-forma/domain-consent';

export class CreatePresentationSessionUseCase {
  constructor(
    private readonly walletRepo: WalletRepositoryPort,
    private readonly consentRepo: ConsentRepositoryPort
  ) {}

  async execute(
    input: CreatePresentationSessionInput
  ): Promise<PresentationSession> {
    const dataRequest = await this.consentRepo.findDataRequestById(
      input.dataRequestId
    );
    if (!dataRequest) {
      throw new AppError(
        'DATA_REQUEST_NOT_FOUND',
        'Data request not found',
        404
      );
    }

    const subject = await this.walletRepo.findUserSubjectById(
      input.userSubjectId
    );
    if (!subject) {
      throw new AppError(
        'USER_SUBJECT_NOT_FOUND',
        'User subject not found',
        404
      );
    }

    return this.walletRepo.createPresentationSession(input);
  }
}
