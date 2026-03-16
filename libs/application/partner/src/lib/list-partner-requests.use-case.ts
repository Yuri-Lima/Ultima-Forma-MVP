import type {
  PartnerDashboardRepositoryPort,
} from '@ultima-forma/domain-partner';
import type {
  DataRequestListItem,
  ListDataRequestsPagination,
} from '@ultima-forma/domain-consent';

export interface ListPartnerRequestsInput {
  partnerId: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export class ListPartnerRequestsUseCase {
  constructor(
    private readonly dashboardRepo: PartnerDashboardRepositoryPort
  ) {}

  async execute(
    input: ListPartnerRequestsInput
  ): Promise<{ items: DataRequestListItem[]; total: number }> {
    const pagination: ListDataRequestsPagination = {
      limit: input.limit ?? 50,
      offset: input.offset ?? 0,
    };
    return this.dashboardRepo.listPartnerRequests(
      input.partnerId,
      { status: input.status },
      pagination
    );
  }
}
