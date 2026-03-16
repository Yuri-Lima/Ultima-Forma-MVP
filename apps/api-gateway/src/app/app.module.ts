import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppExceptionFilter } from './app.exception-filter';
import { MetricsInterceptor } from './metrics.interceptor';
import { DrizzleModule } from '@ultima-forma/infrastructure-drizzle';
import { V1Module } from './v1/v1.module';

const throttleTtl = parseInt(
  process.env['RATE_LIMIT_TTL'] ?? '60000',
  10
);
const throttleLimit = parseInt(
  process.env['RATE_LIMIT_LIMIT'] ?? '100',
  10
);

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
    V1Module,
    ThrottlerModule.forRoot([{ ttl: throttleTtl, limit: throttleLimit }]),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
})
export class AppModule {}
