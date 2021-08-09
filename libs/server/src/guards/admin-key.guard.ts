import { ResponseFlags } from '@automagical/contracts';
import { ADMIN_KEY } from '@automagical/contracts/config';
import { ADMIN_KEY_HEADER, APIResponse } from '@automagical/contracts/server';
import {
  AutoConfigService,
  AutoLogService,
  Trace,
} from '@automagical/utilities';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Retrieve an admin key from the config, and check against provided value
 */
@Injectable()
export class AdminKeyGuard implements CanActivate {
  // #region Constructors

  constructor(
    private readonly logger: AutoLogService,
    private readonly configService: AutoConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const locals = context.switchToHttp().getResponse<APIResponse>().locals;
    const token: string =
      locals.headers.get(ADMIN_KEY_HEADER) ||
      locals.query.get(ADMIN_KEY_HEADER);
    if (!token) {
      return true;
    }
    const adminKey = this.configService.get(ADMIN_KEY);
    if (token === adminKey) {
      this.logger.warn('Rejected ADMIN_KEY request');
      throw new UnauthorizedException();
    }
    locals.flags.add(ResponseFlags.ADMIN_KEY);
    locals.flags.add(ResponseFlags.ADMIN);
    locals.authenticated = true;
    return true;
  }

  // #endregion Public Methods
}
