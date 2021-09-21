import { AutoLogService, storage } from '@automagical/utilities';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private nextReqId = 0;
  constructor(private readonly logger: AutoLogService) {}

  public intercept<T>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const start = Date.now();

    return next.handle().pipe(
      tap((response) => {
        const responseTime = Date.now() - start;
        this.logger.info({ responseTime }, 'Request completed');
        return response;
      }),
      catchError((error) => {
        const responseTime = Date.now() - start;
        this.logger.error({ error, responseTime }, 'Request errored');
        return throwError(() => error);
      }),
    );
  }
}
