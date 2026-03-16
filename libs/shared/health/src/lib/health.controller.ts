import { Controller, Get, Inject, Res } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { sql } from 'drizzle-orm';
import { logger, metricsRegistry } from '@ultima-forma/shared-logger';
import { DRIZZLE, type DrizzleDB } from '@ultima-forma/infrastructure-drizzle';
import { getConfig } from '@ultima-forma/shared-config';
import type { Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';

const startTime = Date.now();

interface BuildInfo {
  version: string;
  gitCommit: string;
  buildTime: string;
}

function loadBuildInfo(): BuildInfo {
  const candidates = [
    path.join(process.cwd(), 'build-info.json'),
    path.join(__dirname, 'build-info.json'),
  ];
  for (const filePath of candidates) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as BuildInfo;
    } catch {
      // continue
    }
  }
  return {
    version: process.env['npm_package_version'] ?? '0.0.0',
    gitCommit: 'unknown',
    buildTime: 'unknown',
  };
}

@Controller()
export class HealthController {
  private readonly buildInfo: BuildInfo;

  constructor(
    @Inject(DRIZZLE) private readonly db: DrizzleDB,
  ) {
    this.buildInfo = loadBuildInfo();
  }

  @SkipThrottle()
  @Get('health')
  async getHealth() {
    const response: Record<string, unknown> = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeMs: Date.now() - startTime,
      version: this.buildInfo.version,
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

    try {
      getConfig();
      checks['config'] = 'ok';
    } catch {
      checks['config'] = 'failed';
      ready = false;
    }

    return {
      ready,
      checks,
      timestamp: new Date().toISOString(),
    };
  }

  @SkipThrottle()
  @Get('version')
  getVersion() {
    const config = getConfig();
    return {
      version: this.buildInfo.version,
      gitCommit: this.buildInfo.gitCommit,
      buildTime: this.buildInfo.buildTime,
      environment: config.nodeEnv,
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
