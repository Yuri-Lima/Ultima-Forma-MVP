import { AppError } from '@ultima-forma/shared-errors';
import type {
  Issuer,
  PartnerRepositoryPort,
  UpdateIssuerInput,
} from '@ultima-forma/domain-partner';
import type {
  AuditRepositoryPort,
  CreateAuditEventInput,
} from '@ultima-forma/domain-audit';
import type { ProfileChangeEvent, WebhookDispatcherPort } from '@ultima-forma/domain-webhook';

export class UpdateIssuerUseCase {
  constructor(
    private readonly repo: PartnerRepositoryPort,
    private readonly auditRepo: AuditRepositoryPort,
    private readonly webhookDispatcher: WebhookDispatcherPort
  ) {}

  async execute(issuerId: string, input: UpdateIssuerInput): Promise<Issuer> {
    const issuer = await this.repo.findIssuerById(issuerId);
    if (!issuer) {
      throw new AppError('ISSUER_NOT_FOUND', 'Issuer not found', 404);
    }

    const before = { ...issuer };
    const updated = await this.repo.updateIssuer(issuerId, input);

    const auditPayload: CreateAuditEventInput = {
      eventType: 'issuer_updated',
      aggregateType: 'issuer',
      aggregateId: issuerId,
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
      eventType: 'issuer.updated',
      aggregateType: 'issuer',
      aggregateId: issuerId,
      payload: {
        issuerId,
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
