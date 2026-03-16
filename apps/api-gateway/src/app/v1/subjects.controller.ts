import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  RegisterUserSubjectUseCase,
  RegisterCredentialReferenceUseCase,
} from '@ultima-forma/application-consent';
import type { WalletRepositoryPort } from '@ultima-forma/domain-consent';
import { PartnerSignatureGuard } from '../guards/partner-signature.guard';
import {
  REGISTER_USER_SUBJECT,
  REGISTER_CREDENTIAL_REFERENCE,
  WALLET_REPOSITORY,
} from './v1.module';

@UseGuards(PartnerSignatureGuard)
@Controller('v1/subjects')
export class SubjectsController {
  constructor(
    @Inject(REGISTER_USER_SUBJECT)
    private readonly registerSubject: RegisterUserSubjectUseCase,
    @Inject(REGISTER_CREDENTIAL_REFERENCE)
    private readonly registerCredential: RegisterCredentialReferenceUseCase,
    @Inject(WALLET_REPOSITORY)
    private readonly walletRepo: WalletRepositoryPort
  ) {}

  @Post()
  async create(
    @Body() body: { tenantId: string; externalSubjectRef: string }
  ) {
    const result = await this.registerSubject.execute(body);
    return {
      id: result.id,
      tenantId: result.tenantId,
      externalSubjectRef: result.externalSubjectRef,
      createdAt: result.createdAt.toISOString(),
    };
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const result = await this.walletRepo.findUserSubjectById(id);
    if (!result) return { error: 'Not found' };
    return {
      id: result.id,
      tenantId: result.tenantId,
      externalSubjectRef: result.externalSubjectRef,
      createdAt: result.createdAt.toISOString(),
    };
  }

  @Post(':id/credentials')
  async addCredential(
    @Param('id') subjectId: string,
    @Body()
    body: {
      issuerId: string;
      claimDefinitionId?: string;
      externalCredentialRef: string;
      issuedAt?: string;
      expiresAt?: string;
    }
  ) {
    const result = await this.registerCredential.execute({
      userSubjectId: subjectId,
      issuerId: body.issuerId,
      claimDefinitionId: body.claimDefinitionId,
      externalCredentialRef: body.externalCredentialRef,
      issuedAt: body.issuedAt ? new Date(body.issuedAt) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
    });
    return {
      id: result.id,
      userSubjectId: result.userSubjectId,
      issuerId: result.issuerId,
      status: result.status,
      createdAt: result.createdAt.toISOString(),
    };
  }
}
