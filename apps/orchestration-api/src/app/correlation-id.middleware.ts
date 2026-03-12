import { randomUUID } from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';

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
  next();
}
