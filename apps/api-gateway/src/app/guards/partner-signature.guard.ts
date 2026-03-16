import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { logger } from '@ultima-forma/shared-logger';
import { getConfig } from '@ultima-forma/shared-config';
import type { ValidatePartnerSignatureUseCase } from '@ultima-forma/application-partner';
import type { RegisterPartnerApiUsageUseCase } from '@ultima-forma/application-partner';

export const SKIP_PARTNER_AUTH_KEY = 'skipPartnerAuth';
export const VALIDATE_PARTNER_SIGNATURE = 'VALIDATE_PARTNER_SIGNATURE';
export const REGISTER_PARTNER_API_USAGE = 'REGISTER_PARTNER_API_USAGE';

@Injectable()
export class PartnerSignatureGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(VALIDATE_PARTNER_SIGNATURE)
    private readonly validateSignature: ValidatePartnerSignatureUseCase,
    @Inject(REGISTER_PARTNER_API_USAGE)
    private readonly registerUsage: RegisterPartnerApiUsageUseCase
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const config = getConfig();

    if (!config.partnerAuthEnabled) {
      return true;
    }

    const skipAuth = this.reflector.getAllAndOverride<boolean>(
      SKIP_PARTNER_AUTH_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (skipAuth) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const partnerId = request.headers['x-partner-id'] as string | undefined;
    const timestamp = request.headers['x-timestamp'] as string | undefined;
    const signature = request.headers['x-signature'] as string | undefined;

    if (!partnerId || !timestamp || !signature) {
      logger.warn('Partner auth: missing headers', {
        hasPartnerId: !!partnerId,
        hasTimestamp: !!timestamp,
        hasSignature: !!signature,
        path: request.url,
        method: request.method,
      });
      throw new UnauthorizedException(
        'Missing required authentication headers: X-Partner-Id, X-Timestamp, X-Signature'
      );
    }

    const rawBody =
      typeof request.body === 'object'
        ? JSON.stringify(request.body)
        : String(request.body ?? '');

    const startTime = Date.now();
    const result = await this.validateSignature.execute({
      partnerId,
      timestamp,
      signature,
      method: request.method,
      path: request.url.split('?')[0],
      body: rawBody,
      toleranceMs: config.partnerAuthTimestampToleranceMs,
    });

    const responseTimeMs = Date.now() - startTime;

    if (!result.valid) {
      logger.warn('Partner auth failed', {
        partnerId,
        reason: result.reason,
        path: request.url,
        method: request.method,
      });

      this.registerUsage
        .execute({
          partnerId,
          route: request.url.split('?')[0],
          method: request.method,
          statusCode: 401,
          correlationId: request.headers['x-correlation-id'] as string,
          responseTimeMs,
        })
        .catch(() => {});

      throw new UnauthorizedException(
        `Authentication failed: ${result.reason}`
      );
    }

    request['partnerId'] = partnerId;

    this.registerUsage
      .execute({
        partnerId,
        route: request.url.split('?')[0],
        method: request.method,
        statusCode: 200,
        correlationId: request.headers['x-correlation-id'] as string,
        responseTimeMs,
      })
      .catch(() => {});

    return true;
  }
}
