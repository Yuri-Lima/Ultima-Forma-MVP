import { AppError } from '@ultima-forma/shared-errors';
import type {
  PartnerDashboardMetrics,
  PartnerDashboardRepositoryPort,
  PartnerRepositoryPort,
} from '@ultima-forma/domain-partner';

export class GetPartnerDashboardUseCase {
  constructor(
    private readonly dashboardRepo: PartnerDashboardRepositoryPort,
    private readonly partnerRepo: PartnerRepositoryPort
  ) {}

  async execute(partnerId: string): Promise<PartnerDashboardMetrics> {
    const partner = await this.partnerRepo.findPartnerById(partnerId);
    if (!partner) {
      throw new AppError('PARTNER_NOT_FOUND', 'Partner not found', 404);
    }
    return this.dashboardRepo.getDashboardMetrics(partnerId);
  }
}
