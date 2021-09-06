import {
  APIResponse,
  AUTHENTICATION_HEADER,
} from '@automagical/contracts/server';
import { AutoLogService, InjectConfig, Trace } from '@automagical/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

import { BASIC_PASSWORD, BASIC_USERNAME } from '../config';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  // #region Constructors

  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(BASIC_USERNAME)
    private readonly username: string,
    @InjectConfig(BASIC_PASSWORD)
    private readonly password: string,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    if (!this.sanityCheck()) {
      return false;
    }

    const { headers } = context
      .switchToHttp()
      .getResponse<APIResponse>().locals;
    if (!headers.has('authorization')) {
      this.logger.debug(`No auth header`);
      return false;
    }
    const [, authString] = headers.get(AUTHENTICATION_HEADER).split(' ');
    const [username, password] = Buffer.from(authString, 'base64')
      .toString()
      .split(':');
    return username === this.username && password === this.password;
  }

  // #endregion Public Methods

  // #region Private Methods

  private sanityCheck() {
    // if (!BASIC_USERNAME || BASIC_USERNAME === DEFAULT_BASIC_USERNAME) {
    //   this.logger.error(`BASIC_USERNAME not defined`);
    //   return false;
    // }
    // if (!BASIC_PASSWORD || BASIC_PASSWORD === DEFAULT_BASIC_PASSWORD) {
    //   this.logger.error(`BASIC_PASSWORD not defined`);
    //   return false;
    // }
    return true;
  }

  // #endregion Private Methods
}
