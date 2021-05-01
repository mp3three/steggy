import { APP_API_SERVER } from '@automagical/contracts/constants';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { ResponseLocalsDTO } from '../../typings';

type Res = Response<unknown, ResponseLocalsDTO>;
@Injectable()
export class LocalsInitMiddlware implements NestMiddleware {
  // #region Constructors

  constructor(
    @InjectLogger(LocalsInitMiddlware, APP_API_SERVER)
    protected readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace() r;
  public async use(req: Request, res: Res, next: NextFunction): Promise<void> {
    this.initPermissions(res);
    next();
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected initPermissions(res: Res): void {
    res.locals.permissions = {
      all: false,
      own: false,
      admin: false,
      self: false,
    };
  }

  // #endregion Protected Methods
}
