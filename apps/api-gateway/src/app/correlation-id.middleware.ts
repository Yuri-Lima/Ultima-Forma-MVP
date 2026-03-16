import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { logger } from '@ultima-forma/shared-logger';

const HEADER = 'X-Correlation-ID';

export function correlationIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const incoming =
    (req.headers['x-correlation-id'] as string) ??
    (req.headers['x-request-id'] as string);
  const id = incoming ?? randomUUID();
  (req as Request & { correlationId: string }).correlationId = id;
  res.setHeader(HEADER, id);

  const partnerId = req.headers['x-partner-id'] as string | undefined;
  logger.info('request_start', {
    correlationId: id,
    method: req.method,
    path: req.url?.split('?')[0],
    partnerId: partnerId ?? undefined,
  });

  next();
}
