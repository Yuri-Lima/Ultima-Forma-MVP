import { AppError } from '@ultima-forma/shared-errors';
import type {
  CreateCredentialReferenceInput,
  CredentialReference,
  WalletRepositoryPort,
} from '@ultima-forma/domain-consent';

export class RegisterCredentialReferenceUseCase {
  constructor(private readonly walletRepo: WalletRepositoryPort) {}

  async execute(
    input: CreateCredentialReferenceInput
  ): Promise<CredentialReference> {
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
    return this.walletRepo.createCredentialReference(input);
  }
}
