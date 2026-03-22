import { getConfig } from '@ultima-forma/shared-config';

export function getRedisConnectionConfig(): {
  host: string;
  port: number;
  password?: string;
  db?: number;
  maxRetriesPerRequest: number | null;
} {
  const config = getConfig();
  return {
    host: config.redis.host,
    port: config.redis.port,
    password: config.redis.password,
    db: config.redis.db,
    maxRetriesPerRequest: null,
  };
}

export function getQueuePrefix(): string {
  return getConfig().queue.prefix;
}
