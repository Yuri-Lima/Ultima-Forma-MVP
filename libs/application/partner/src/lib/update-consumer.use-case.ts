import { AppError } from '@ultima-forma/shared-errors';
import type {
  Consumer,
  PartnerRepositoryPort,
  UpdateConsumerInput,
} from '@ultima-forma/domain-partner';
import type {
  AuditRepositoryPort,
  CreateAuditEventInput,
} from '@ultima-forma/domain-audit';
import type { ProfileChangeEvent, WebhookDispatcherPort } from '@ultima-forma/domain-webhook';

export class UpdateConsumerUseCase {
  constructor(
    private readonly repo: PartnerRepositoryPort,
    private readonly auditRepo: AuditRepositoryPort,
    private readonly webhookDispatcher: WebhookDispatcherPort
  ) {}

  async execute(consumerId: string, input: UpdateConsumerInput): Promise<Consumer> {
    const consumer = await this.repo.findConsumerById(consumerId);
    if (!consumer) {
      throw new AppError('CONSUMER_NOT_FOUND', 'Consumer not found', 404);
    }

    const before = { ...consumer };
    const updated = await this.repo.updateConsumer(consumerId, input);

    const auditPayload: CreateAuditEventInput = {
      eventType: 'consumer_updated',
      aggregateType: 'consumer',
      aggregateId: consumerId,
      payload: {
        before: {
          name: before.name,
          status: before.status,
          scopes: before.scopes,
        },
        after: {
          name: updated.name,
          status: updated.status,
          scopes: updated.scopes,
        },
      },
    };
    await this.auditRepo.append(auditPayload);

    const profileEvent: ProfileChangeEvent = {
      eventType: 'consumer.updated',
      aggregateType: 'consumer',
      aggregateId: consumerId,
      payload: {
        consumerId,
        partnerId: updated.partnerId,
        tenantId: updated.tenantId,
        name: updated.name,
        status: updated.status,
        scopes: updated.scopes,
        updatedAt: updated.updatedAt.toISOString(),
      },
      occurredAt: new Date(),
    };
    await this.webhookDispatcher.dispatch(updated.partnerId, profileEvent);

    return updated;
  }
}
