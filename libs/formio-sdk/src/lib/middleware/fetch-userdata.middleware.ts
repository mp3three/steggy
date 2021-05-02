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
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<void> {
    if (!request.headers['x-jwt-token']) {
      throw new HttpException(
        {
          error: 'x-jwt-token required',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const user = await this.formioSdkService.userFetch({
      token: request.headers['x-jwt-token'] as string,
    });
    if (!user) {
      throw new HttpException(
        {
          error: 'invalid x-jwt-token',
          status: HttpStatus.FORBIDDEN,
        },
        HttpStatus.FORBIDDEN,
      );
    }
    response.locals.user = user;
    next();
  }

  // #endregion Public Methods
}
