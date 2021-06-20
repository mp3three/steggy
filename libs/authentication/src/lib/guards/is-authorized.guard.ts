import { LIB_AUTHENTICATION } from '@automagical/contracts/constants';
import { APIResponse } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';
import { Observable } from 'rxjs';

@Injectable()
export class IsAuthorizedGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger(IsAuthorizedGuard, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const { locals } = context.switchToHttp().getResponse<APIResponse>();
    return locals.authenticated;
  }

  // #endregion Public Methods
}
