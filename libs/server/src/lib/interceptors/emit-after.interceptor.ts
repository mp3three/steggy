import { ResponseLocals } from '@automagical/contracts';
import { LIB_SERVER } from '@automagical/contracts/constants';
import { APIResponse, SERVER_METADATA } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class EmitAfterInterceptor implements NestInterceptor {
  // #region Constructors

  constructor(
    @InjectLogger(EmitAfterInterceptor, LIB_SERVER)
    private readonly logger: PinoLogger,
    private readonly reflector: Reflector,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    return next.handle().pipe(
      tap((returnResult: unknown) => {
        const key = this.reflector.get<keyof ResponseLocals>(
          SERVER_METADATA.RES_LOCAL_KEY,
          context.getHandler(),
        );
        if (key) {
          const { locals } = context.switchToHttp().getResponse<APIResponse>();
          // key comes from known hard coded source exclusively
          // eslint-disable-next-line security/detect-object-injection
          returnResult = locals[key];
        }
        const eventName = this.reflector.get<string>(
          SERVER_METADATA.EMIT_AFTER,
          context.getHandler(),
        );
        this.eventEmitter.emit(eventName, returnResult);
      }),
    );
  }

  // #endregion Public Methods
}
