import { AutoLogService } from '@automagical/boilerplate';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';

import { APIRequest, APIResponse } from '../contracts';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AutoLogService) {}

  public intercept<T>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const prettyLogger = AutoLogService.prettyLogger;
    const request = context.switchToHttp().getRequest<APIRequest>();
    const extra = prettyLogger ? {} : { route: [request.method, request.path] };
    const { locals } = context.switchToHttp().getResponse<APIResponse>();
    return next.handle().pipe(
      tap(response => {
        if (this.ignorePath(request.path)) {
          // Request counter is still incremented, even if no logs are ever printed for request
          return;
        }
        const responseTime = Date.now() - locals.start.getTime();
        const message = prettyLogger
          ? `[${request.method}] {${request.path}}`
          : 'Request completed';
        this.logger.info({ responseTime, ...extra }, message);
        return response;
      }),
      catchError(error => {
        const responseTime = Date.now() - locals.start.getTime();

        const message = prettyLogger
          ? `[${request.method}] {${request.path}} ${error.message}`
          : `Request errored ${error.message}`;
        this.logger.error(
          { responseTime, stack: error.stack, ...extra },
          message,
        );
        // This results in double errors
        // One coming from here, one from nestsjs (with undefined context?)
        return throwError(() => error);
      }),
    );
  }

  private ignorePath(path: string): boolean {
    return ['/health'].some(str => path.endsWith(str));
  }
}
