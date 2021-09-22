import { AutoLogService } from '@automagical/utilities';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { APIRequest } from '..';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AutoLogService) {}

  public intercept<T>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest<APIRequest>();
    const extra = {
      route: [request.method, request.path],
    };

    return next.handle().pipe(
      tap((response) => {
        const responseTime = Date.now() - start;
        this.logger.info({ responseTime, ...extra }, 'Request completed');
        return response;
      }),
      catchError((error) => {
        const responseTime = Date.now() - start;
        this.logger.error({ error, responseTime, ...extra }, 'Request errored');
        return throwError(() => error);
      }),
    );
  }
}
