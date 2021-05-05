import { LIB_AUTHENTICATION } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {
  // #region Constructors

  constructor(
    @InjectLogger(LocalAuthGuard, LIB_AUTHENTICATION)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
  ) {
    super({
      passReqToCallback: true,
    });
  }

  // #endregion Constructors

  // #region Public Methods

  public async validate(
    request: Request,
    username: string,
    password: string,
  ): Promise<boolean> {
    const state =
      this.configService.get('authentication.username') === username &&
      this.configService.get('authentication.password') === password;
    if (state) {
      return true;
    }
    throw new UnauthorizedException();
  }

  // #endregion Public Methods
}
