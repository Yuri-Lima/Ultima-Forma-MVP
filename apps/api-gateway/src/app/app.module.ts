import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppExceptionFilter } from './app.exception-filter';
import { MetricsInterceptor } from './metrics.interceptor';
import { DrizzleModule } from '@ultima-forma/infrastructure-drizzle';
import { HealthModule } from '@ultima-forma/shared-health';
import { getConfig } from '@ultima-forma/shared-config';
import { V1Module } from './v1/v1.module';

const config = getConfig();

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'pt-BR',
      loaderOptions: {
        path: join(process.cwd(), 'libs/shared/i18n/src/locales'),
        watch: false,
      },
      resolvers: [AcceptLanguageResolver],
    }),
    DrizzleModule,
    HealthModule,
    V1Module,
    ThrottlerModule.forRoot([
      { ttl: config.rateLimitTtl, limit: config.rateLimitLimit },
    ]),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
})
export class AppModule {}
