import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AppError } from '@ultima-forma/shared-errors';

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof AppError) {
      const message = await this.i18n.t(`api.errors.${exception.code}`, {
        defaultValue: exception.message,
      });
      response.status(exception.statusCode).json({
        code: exception.code,
        message,
        statusCode: exception.statusCode,
      });
      return;
    }

    const message = await this.i18n.t('api.errors.INTERNAL_ERROR');
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      code: 'INTERNAL_ERROR',
      message,
      statusCode: 500,
    });
  }
}
