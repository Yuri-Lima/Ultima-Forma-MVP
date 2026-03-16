import { AppError } from '@ultima-forma/shared-errors';
import type {
  CreateWebhookInput,
  PartnerDashboardRepositoryPort,
  PartnerRepositoryPort,
  UpdateWebhookInput,
  WebhookSubscriptionSummary,
} from '@ultima-forma/domain-partner';

export class ManagePartnerWebhooksUseCase {
  constructor(
    private readonly dashboardRepo: PartnerDashboardRepositoryPort,
    private readonly partnerRepo: PartnerRepositoryPort
  ) {}

  async list(partnerId: string): Promise<WebhookSubscriptionSummary[]> {
    return this.dashboardRepo.listPartnerWebhooks(partnerId);
  }

  async create(
    input: CreateWebhookInput
  ): Promise<WebhookSubscriptionSummary> {
    const partner = await this.partnerRepo.findPartnerById(input.partnerId);
    if (!partner) {
      throw new AppError('PARTNER_NOT_FOUND', 'Partner not found', 404);
    }
    return this.dashboardRepo.createWebhook(input);
  }

  async update(
    id: string,
    input: UpdateWebhookInput
  ): Promise<WebhookSubscriptionSummary> {
    return this.dashboardRepo.updateWebhook(id, input);
  }
}
