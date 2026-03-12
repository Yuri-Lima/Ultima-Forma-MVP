import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { getConfig } from '@ultima-forma/shared-config';
import { logger } from '@ultima-forma/shared-logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );
  const config = getConfig();
  const port = config.orchestrationApiPort;
  await app.listen(port);
  logger.info(`Orchestration API running on http://localhost:${port}`);
  logger.info(`Health check: http://localhost:${port}/health`);
}

bootstrap();
