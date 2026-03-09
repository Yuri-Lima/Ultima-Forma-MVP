import { Controller, Get, Inject } from '@nestjs/common';
import { sql } from 'drizzle-orm';
import { DRIZZLE, type DrizzleDB } from '@ultima-forma/infrastructure-drizzle';
import { logger } from '@ultima-forma/shared-logger';

@Controller()
export class AppController {
  constructor(@Inject(DRIZZLE) private readonly db: DrizzleDB) {}

  @Get('health')
  async getHealth(): Promise<{ status: string; timestamp: string; db?: string }> {
    const response: { status: string; timestamp: string; db?: string } = {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };

    try {
      await this.db.execute(sql`SELECT 1`);
      response.db = 'connected';
    } catch (err) {
      logger.error('Database health check failed', { error: String(err) });
      response.db = 'disconnected';
    }

    return response;
  }
}
