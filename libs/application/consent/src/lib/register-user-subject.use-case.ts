import type {
  CreateUserSubjectInput,
  UserSubject,
  WalletRepositoryPort,
} from '@ultima-forma/domain-consent';

export class RegisterUserSubjectUseCase {
  constructor(private readonly walletRepo: WalletRepositoryPort) {}

  async execute(input: CreateUserSubjectInput): Promise<UserSubject> {
    return this.walletRepo.createUserSubject(input);
  }
}
