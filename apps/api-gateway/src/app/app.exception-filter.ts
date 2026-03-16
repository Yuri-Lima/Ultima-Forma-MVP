import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { I18nService } from 'nestjs-i18n';
import { AppError, ErrorCode } from '@ultima-forma/shared-errors';
import { logger } from '@ultima-forma/shared-logger';

interface StandardErrorResponse {
  errorCode: string;
  message: string;
  correlationId: string;
  timestamp: string;
}

const HTTP_STATUS_TO_ERROR_CODE: Record<number, string> = {
  400: ErrorCode.BAD_REQUEST,
  401: ErrorCode.UNAUTHORIZED,
  403: ErrorCode.FORBIDDEN,
  404: ErrorCode.NOT_FOUND,
  422: ErrorCode.VALIDATION_ERROR,
  429: ErrorCode.RATE_LIMIT_EXCEEDED,
};

@Catch()
export class AppExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  async catch(exception: unknown, host: ArgumentsHost): Promise<void> {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId =
      (request.headers['x-correlation-id'] as string) ?? 'unknown';
    const timestamp = new Date().toISOString();

    if (exception instanceof AppError) {
      const message = await this.i18n.t(`api.errors.${exception.code}`, {
        defaultValue: exception.message,
      });
      const body: StandardErrorResponse = {
        errorCode: exception.code,
        message,
        correlationId,
        timestamp,
      };
      response.status(exception.statusCode).json(body);
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const errorCode =
        HTTP_STATUS_TO_ERROR_CODE[status] ?? ErrorCode.INTERNAL_ERROR;

      let message: string;
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null &&
        'message' in exceptionResponse
      ) {
        const msg = (exceptionResponse as { message: unknown }).message;
        message = Array.isArray(msg) ? msg.join('; ') : String(msg);
      } else {
        message = exception.message;
      }

      const body: StandardErrorResponse = {
        errorCode,
        message,
        correlationId,
        timestamp,
      };
      response.status(status).json(body);
      return;
    }

    logger.error('Unhandled exception', {
      correlationId,
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    const message = await this.i18n.t('api.errors.INTERNAL_ERROR', {
      defaultValue: 'An internal error occurred',
    });
    const body: StandardErrorResponse = {
      errorCode: ErrorCode.INTERNAL_ERROR,
      message,
      correlationId,
      timestamp,
    };
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json(body);
  }
}
