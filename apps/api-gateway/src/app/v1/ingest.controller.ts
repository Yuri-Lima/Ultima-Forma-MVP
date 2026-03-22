import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import type { IngestRepository } from '@ultima-forma/infrastructure-drizzle';
import type { AuditRepositoryPort } from '@ultima-forma/domain-audit';
import { INGEST_REPOSITORY, AUDIT_REPOSITORY } from './tokens';

@Controller('v1/issuers')
export class IngestController {
  constructor(
    @Inject(INGEST_REPOSITORY)
    private readonly ingestRepo: IngestRepository,
    @Inject(AUDIT_REPOSITORY)
    private readonly auditRepo: AuditRepositoryPort
  ) {}

  @Post(':issuerId/ingest')
  async ingest(
    @Param('issuerId', ParseUUIDPipe) issuerId: string,
    @Body() body: { cpf: string; phone: string; extraFields?: string[] }
  ) {
    const tenantId = await this.ingestRepo.getDefaultTenantId();
    const submission = await this.ingestRepo.createProfileSubmission({
      issuerId,
      tenantId,
      cpf: body.cpf,
      phone: body.phone,
      extraFields: body.extraFields ?? [],
    });

    await this.auditRepo.append({
      eventType: 'profile_data_received',
      aggregateType: 'profile_submission',
      aggregateId: submission.id,
      payload: {
        issuerId,
        cpf: body.cpf,
        fieldsCount: 2 + (body.extraFields?.length ?? 0),
      },
    });

    return {
      id: submission.id,
      status: submission.status,
      createdAt: submission.createdAt.toISOString(),
    };
  }
}
