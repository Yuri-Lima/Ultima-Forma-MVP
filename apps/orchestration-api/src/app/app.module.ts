import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { DrizzleModule } from '@ultima-forma/infrastructure-drizzle';
import { AppExceptionFilter } from './app.exception-filter';
import { InternalModule } from './internal/internal.module';

@Module({
  imports: [DrizzleModule, InternalModule],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: AppExceptionFilter }],
})
export class AppModule {}
