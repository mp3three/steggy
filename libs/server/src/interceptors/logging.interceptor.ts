import { AutoLogService } from '@automagical/utilities';
import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AutoLogService) {}

  public intercept<T>(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<unknown> {
    const now = Date.now();
    return next.handle().pipe(
      tap(() => {
        this.logger.error('yay');
      }),
    );
  }
}
