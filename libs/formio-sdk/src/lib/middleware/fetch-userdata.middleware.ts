import { Logger } from '@automagical/logger';
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
} from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { FormioSdkService } from '../services';

@Injectable()
export class FetchUserdataMiddleware implements NestMiddleware {
  // #region Object Properties

  private readonly logger = Logger(FetchUserdataMiddleware);

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly formioSdkService: FormioSdkService) {}

  // #endregion Constructors

  // #region Public Methods

  public async use(req: Request, res: Response, next: NextFunction) {
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
