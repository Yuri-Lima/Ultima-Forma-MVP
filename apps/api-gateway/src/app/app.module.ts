import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppExceptionFilter } from './app.exception-filter';
import { DrizzleModule } from '@ultima-forma/infrastructure-drizzle';
import { V1Module } from './v1/v1.module';

@Module({
  imports: [DrizzleModule, V1Module],
  controllers: [AppController],
  providers: [{ provide: APP_FILTER, useClass: AppExceptionFilter }],
})
export class AppModule {}
