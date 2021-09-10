import { ADMIN_KEY } from '@automagical/contracts/config';
import { ADMIN_KEY_HEADER, APIResponse } from '@automagical/contracts/server';
import {
  AutoConfigService,
  AutoLogService,
  ConsumesConfig,
  Trace,
} from '@automagical/utilities';
import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Retrieve an admin key from the config, and check against provided value
 */
@ConsumesConfig([ADMIN_KEY])
export class AdminKeyGuard implements CanActivate {
  

  constructor(
    private readonly logger: AutoLogService,
    private readonly configService: AutoConfigService,
  ) {}

  

  

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
    // locals.flags.add(ResponseFlags.ADMIN_KEY);
    // locals.flags.add(ResponseFlags.ADMIN);
    locals.authenticated = true;
    return true;
  }

  
}
