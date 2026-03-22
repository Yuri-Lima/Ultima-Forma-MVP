import { Body, Controller, Inject, Post, UseGuards } from '@nestjs/common';
import { RotateIntegrationCredentialUseCase } from '@ultima-forma/application-partner';
import { InternalApiKeyGuard } from './internal-api-key.guard';

@Controller('internal/credentials')
@UseGuards(InternalApiKeyGuard)
export class CredentialsController {
  constructor(
    @Inject('ROTATE_CREDENTIAL')
    private readonly rotateCredential: RotateIntegrationCredentialUseCase,
  ) {}

  @Post('rotate')
  async rotate(@Body() body: { partnerId: string }) {
    const result = await this.rotateCredential.execute(body.partnerId);
    return {
      credentialId: result.credentialId,
      secret: result.secret,
      message:
        'Store this secret securely. It will not be shown again.',
    };
  }
}
