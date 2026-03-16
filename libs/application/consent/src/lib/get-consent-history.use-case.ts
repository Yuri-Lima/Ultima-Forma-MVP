import type {
  ConsentRepositoryPort,
  ConsentWithDetails,
  ListConsentsFilters,
  ListDataRequestsPagination,
} from '@ultima-forma/domain-consent';

export interface GetConsentHistoryInput {
  tenantId: string;
  status?: 'pending' | 'approved' | 'rejected' | 'revoked';
  limit?: number;
  offset?: number;
}

export class GetConsentHistoryUseCase {
  constructor(private readonly repo: ConsentRepositoryPort) {}

  async execute(
    input: GetConsentHistoryInput
  ): Promise<{ items: ConsentWithDetails[]; total: number }> {
    const filters: ListConsentsFilters = {
      tenantId: input.tenantId,
      status: input.status,
    };
    const pagination: ListDataRequestsPagination = {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
    };

    return this.repo.listConsentsByTenant(input.tenantId, filters, pagination);
  }
}
