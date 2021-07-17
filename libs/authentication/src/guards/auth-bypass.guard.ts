import { LIB_AUTHENTICATION } from '@automagical/contracts/constants';
import { APIResponse } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';

@Injectable()
export class AuthBypassGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger(AuthBypassGuard, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { locals } = context.switchToHttp().getResponse<APIResponse>();
    locals.authenticated = true;
    return true;
  }

  // #endregion Public Methods
}
