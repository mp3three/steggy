import {
  AUTHENTICATION_CONFIG,
  AuthenticationConfig,
  DEFAULT_BASIC_PASSWORD,
  DEFAULT_BASIC_USERNAME,
} from '@automagical/contracts/config';
import { LIB_AUTHENTICATION } from '@automagical/contracts/constants';
import { APIResponse, AUTHENTICATION_HEADER } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class BasicAuthGuard implements CanActivate {
  // #region Constructors

  constructor(
    @InjectLogger(BasicAuthGuard, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async canActivate(context: ExecutionContext): Promise<boolean> {
    const { BASIC_PASSWORD, BASIC_USERNAME } =
      this.configService.get<AuthenticationConfig>(AUTHENTICATION_CONFIG);

    if (!this.sanityCheck(BASIC_USERNAME, BASIC_PASSWORD)) {
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
    return username === BASIC_USERNAME && password === BASIC_PASSWORD;
  }

  // #endregion Public Methods

  // #region Private Methods

  private sanityCheck(BASIC_USERNAME: string, BASIC_PASSWORD: string) {
    if (!BASIC_USERNAME || BASIC_USERNAME === DEFAULT_BASIC_USERNAME) {
      this.logger.error(`BASIC_USERNAME not defined`);
      return false;
    }
    if (!BASIC_PASSWORD || BASIC_PASSWORD === DEFAULT_BASIC_PASSWORD) {
      this.logger.error(`BASIC_PASSWORD not defined`);
      return false;
    }
    return false;
  }

  // #endregion Private Methods
}
