import { ResponseFlags } from '@formio/contracts';
import { LIB_AUTHENTICATION } from '@formio/contracts/constants';
import { UserDTO } from '@formio/contracts/formio-sdk';
import { APIResponse, JWT_HEADER } from '@formio/contracts/server';
import { InjectLogger, Trace } from '@formio/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

import { AuthenticationService } from '../services';

@Injectable()
export class JWTAuthGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger(JWTAuthGuard, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
    private readonly authService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const locals = context.switchToHttp().getResponse<APIResponse>().locals;
    const token: string =
      locals.headers.get(JWT_HEADER) || locals.query.get(JWT_HEADER);
    if (!token) {
      // Maybe another strategy will resolve
      return true;
    }
    locals.flags.add(ResponseFlags.JWT_TOKEN);
    locals.session = await this.authService.verifyToken(token);
    locals.user = locals.session.user as UserDTO;

    // Merge in user session roles
    (locals.user.roles || []).forEach((role) => {
      if (!locals.roles.has(role)) {
        locals.roles.add(role);
      }
    });

    locals.roles;
    return true;
  }

  // #endregion Public Methods
}
