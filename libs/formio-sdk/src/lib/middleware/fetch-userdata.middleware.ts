import { LIB_FORMIO_SDK } from '@automagical/contracts/constants';
import { InjectLogger } from '@automagical/utilities';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { FormioSdkService } from '../services';

@Injectable()
export class FetchUserdataMiddleware implements NestMiddleware {
  // #region Constructors

  constructor(
    @InjectLogger(FetchUserdataMiddleware, LIB_FORMIO_SDK)
    protected readonly logger: PinoLogger,
    private readonly formioSdkService: FormioSdkService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async use(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    if (!req.headers['x-jwt-token']) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'x-jwt-token required',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const user = await this.formioSdkService.userFetch({
      token: req.headers['x-jwt-token'] as string,
    });
    if (!user) {
      throw new HttpException(
        {
          status: HttpStatus.FORBIDDEN,
          error: 'invalid x-jwt-token',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    res.locals.user = user;
    next();
  }

  // #endregion Public Methods
}
