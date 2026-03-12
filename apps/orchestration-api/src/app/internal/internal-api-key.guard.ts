import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class InternalApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const requiredKey = process.env['INTERNAL_API_KEY'];
    if (!requiredKey) {
      return true;
    }
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.headers['x-api-key'];
    if (key !== requiredKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    return true;
  }
}
