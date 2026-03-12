import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppExceptionFilter } from './app.exception-filter';
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
    DrizzleModule,
    V1Module,
    ThrottlerModule.forRoot([{ ttl: throttleTtl, limit: throttleLimit }]),
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_FILTER, useClass: AppExceptionFilter },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
