import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import {
  httpRequestsTotal,
  httpRequestDurationMs,
} from '@ultima-forma/shared-logger';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const start = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const res = context.switchToHttp().getResponse();
          const duration = Date.now() - start;
          const path = req.route?.path ?? req.url?.split('?')[0] ?? 'unknown';
          httpRequestsTotal.inc({
            method: req.method,
            path,
            status: String(res.statusCode),
          });
          httpRequestDurationMs.observe(
            { method: req.method, path, status: String(res.statusCode) },
            duration
          );
        },
        error: (err: { status?: number }) => {
          const duration = Date.now() - start;
          const path = req.route?.path ?? req.url?.split('?')[0] ?? 'unknown';
          const status = String(err?.status ?? 500);
          httpRequestsTotal.inc({ method: req.method, path, status });
          httpRequestDurationMs.observe(
            { method: req.method, path, status },
            duration
          );
        },
      })
    );
  }
}
