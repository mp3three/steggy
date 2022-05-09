import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AutoLogService, InjectConfig } from '@steggy/boilerplate';
import { is } from '@steggy/utilities';

import { BASIC_AUTH_PASSWORD, BASIC_AUTH_USERNAME } from '../config';
import { APIResponse, AUTHORIZATION_HEADER } from '../contracts';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(BASIC_AUTH_USERNAME)
    private readonly userName: string,
    @InjectConfig(BASIC_AUTH_PASSWORD)
    private readonly password: string,
  ) {}

  public canActivate(context: ExecutionContext): boolean {
    if (this.userName === '') {
      return true;
    }
    if (is.empty(this.userName) || is.empty(this.password)) {
      return false;
    }

    const { headers } = context
      .switchToHttp()
      .getResponse<APIResponse>().locals;
    if (!headers.has('authorization')) {
      this.logger.debug(`No auth header`);
      return false;
    }
    const header = headers.get(AUTHORIZATION_HEADER) ?? '';
    const [, authString] = header.split(' ');
    const [username, password] = Buffer.from(authString, 'base64')
      .toString()
      .split(':');
    return username === this.userName && password === this.password;
  }
}
