import { AutoLogService, InjectConfig } from '@automagical/boilerplate';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { ADMIN_KEY } from '../config';
import { ADMIN_KEY_HEADER, APIResponse, ResponseFlags } from '../contracts';

@Injectable()
export class AdminKeyGuard implements CanActivate {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(ADMIN_KEY) private readonly adminKey: string,
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    if (!this.adminKey) {
      return true;
    }
    const { locals } = context.switchToHttp().getResponse<APIResponse>();
    const token: string =
      locals.headers.get(ADMIN_KEY_HEADER) ||
      locals.query.get(ADMIN_KEY_HEADER);
    if (!token) {
      return true;
    }
    if (token !== this.adminKey) {
      this.logger.warn('Rejected {ADMIN_KEY} request');
      return false;
    }
    locals.flags.add(ResponseFlags.ADMIN_KEY);
    locals.flags.add(ResponseFlags.ADMIN);
    locals.authenticated = true;
    this.logger.debug(`Authenticated using {ADMIN_KEY}`);
    return true;
  }

  /**
   * Add to the startup logs if an admin key is provided
   */
  protected onPostInit(): void {
    if (this.adminKey) {
      this.logger.warn(`{${ADMIN_KEY_HEADER}} usable`);
    }
  }
}
