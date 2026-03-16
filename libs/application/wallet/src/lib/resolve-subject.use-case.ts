import type {
  UserSubject,
  WalletRepositoryPort,
} from '@ultima-forma/domain-wallet';

export interface ResolveSubjectInput {
  tenantId: string;
  externalSubjectRef: string;
}

export class ResolveSubjectUseCase {
  constructor(private readonly walletRepo: WalletRepositoryPort) {}

  async execute(input: ResolveSubjectInput): Promise<UserSubject> {
    const existing = await this.walletRepo.findByTenantAndExternalRef(
      input.tenantId,
      input.externalSubjectRef
    );
    if (existing) {
      return existing;
    }
    return this.walletRepo.createUserSubject({
      tenantId: input.tenantId,
      externalSubjectRef: input.externalSubjectRef,
    });
  }
}
