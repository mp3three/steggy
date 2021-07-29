import { ResponseFlags } from '@automagical/contracts';
import { ADMIN_KEY } from '@automagical/contracts/config';
import { ADMIN_KEY_HEADER, APIResponse } from '@automagical/contracts/server';
import { AutoConfigService, InjectLogger, Trace } from '@automagical/utilities';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

/**
 * Retrieve an admin key from the config, and check against provided value
 */
@Injectable()
export class AdminKeyGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger()
    private readonly logger: PinoLogger,
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
    if (token === this.configService.get(ADMIN_KEY)) {
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
