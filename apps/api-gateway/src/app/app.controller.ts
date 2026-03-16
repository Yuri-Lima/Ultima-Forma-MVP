import { Controller, Get, Header, Inject, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { sql } from 'drizzle-orm';
import { logger, metricsRegistry } from '@ultima-forma/shared-logger';
import { DRIZZLE, type DrizzleDB } from '@ultima-forma/infrastructure-drizzle';
import type { Response } from 'express';

const startTime = Date.now();

@Controller()
export class AppController {
  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {}

  @SkipThrottle()
  @Get('health')
  async getHealth() {
    const response: Record<string, unknown> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeMs: Date.now() - startTime,
      version: process.env['npm_package_version'] ?? '0.0.0',
    };

    try {
      await this.db.execute(sql`SELECT 1`);
      response['db'] = 'connected';
    } catch (err) {
      logger.error('Database health check failed', { error: String(err) });
      response['db'] = 'disconnected';
      response['status'] = 'degraded';
    }

    return response;
  }

  @SkipThrottle()
  @Get('ready')
  async getReady() {
    const checks: Record<string, string> = {};
    let ready = true;

    try {
      await this.db.execute(sql`SELECT 1`);
      checks['db'] = 'ok';
    } catch {
      checks['db'] = 'failed';
      ready = false;
    }

    return {
      ready,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  @SkipThrottle()
  @Get('metrics')
  async getMetrics(@Res() res: Response) {
    const metrics = await metricsRegistry.metrics();
    res.set('Content-Type', metricsRegistry.contentType);
    res.end(metrics);
  }
}
