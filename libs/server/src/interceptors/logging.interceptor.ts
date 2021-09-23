import { AutoLogService } from '@automagical/utilities';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { APIRequest, APIResponse } from '..';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AutoLogService) {}

  public intercept<T>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const request = context.switchToHttp().getRequest<APIRequest>();
    const extra = {
      route: [request.method, request.path],
    };
    const { locals } = context.switchToHttp().getResponse<APIResponse>();
    return next.handle().pipe(
      tap((response) => {
        const responseTime = Date.now() - locals.start.getTime();
        this.logger.info({ responseTime, ...extra }, 'Request completed');
        return response;
      }),
      catchError((error) => {
        const responseTime = Date.now() - locals.start.getTime();
        if (error.response) {
          error = error.response;
        }
        this.logger.error({ error, responseTime, ...extra }, 'Request errored');
        // This results in double errors
        // One coming from here, one from nestsjs (with undefined context?)
        return throwError(() => error);
      }),
    );
  }
}
