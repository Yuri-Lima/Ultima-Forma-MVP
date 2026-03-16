import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RotateIntegrationCredentialUseCase } from '@ultima-forma/application-partner';
import { RotateCredentialDto } from './rotate-credential.dto';
import { PartnerSignatureGuard } from '../guards/partner-signature.guard';

@UseGuards(PartnerSignatureGuard)
@Controller('v1/integration-credentials')
export class IntegrationCredentialsController {
  constructor(
    private readonly rotateCredential: RotateIntegrationCredentialUseCase
  ) {}

  @Post('rotate')
  async rotate(@Body() dto: RotateCredentialDto) {
    const result = await this.rotateCredential.execute(dto.partnerId);
    return {
      credentialId: result.credentialId,
      secret: result.secret,
      message:
        'Store this secret securely. It will not be shown again.',
    };
  }
}
