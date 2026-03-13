import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import { join } from 'path';
import { AppController } from './app.controller';
import { DrizzleModule } from '@ultima-forma/infrastructure-drizzle';
import { AppExceptionFilter } from './app.exception-filter';
import { InternalModule } from './internal/internal.module';

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
    ScheduleModule.forRoot(),
    DrizzleModule,
    InternalModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: AppExceptionFilter }],
})
export class AppModule {}
