import { LIB_AUTHENTICATION } from '@formio/contracts/constants';
import { APIResponse } from '@formio/contracts/server';
import { InjectLogger, Trace } from '@formio/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ExistsAuthGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger(ExistsAuthGuard, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const { locals } = context.switchToHttp().getResponse<APIResponse>();
    if (locals.form.settings?.allowExistsEndpoint) {
      locals.authenticated = true;
    }
    return true;
  }

  // #endregion Public Methods
}
