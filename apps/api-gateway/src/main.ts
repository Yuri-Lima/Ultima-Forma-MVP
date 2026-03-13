import { config } from 'dotenv';
config(); // Carrega .env do workspace root (cwd ao rodar nx serve)

import { NestFactory } from '@nestjs/core';
import { I18nValidationPipe, I18nValidationExceptionFilter } from 'nestjs-i18n';
import { AppModule } from './app/app.module';
import { correlationIdMiddleware } from './app/correlation-id.middleware';
import { getConfig } from '@ultima-forma/shared-config';
import { logger } from '@ultima-forma/shared-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(correlationIdMiddleware);
  app.enableCors({ origin: true }); // Allow user-app (localhost:8081) and partner-portal
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  app.useGlobalFilters(new I18nValidationExceptionFilter());
  const config = getConfig();
  const port = config.apiGatewayPort;
  await app.listen(port);
  logger.info(`API Gateway running on http://localhost:${port}`);
  logger.info(`Health check: http://localhost:${port}/health`);
}

bootstrap();
