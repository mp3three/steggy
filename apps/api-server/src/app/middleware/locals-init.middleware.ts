import { APP_API_SERVER } from '@automagical/contracts/constants';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { ResponseLocalsDTO } from '../../typings';

type LocalsResponse = Response<unknown, ResponseLocalsDTO>;
@Injectable()
export class LocalsInitMiddlware implements NestMiddleware {
  // #region Constructors

  constructor(
    @InjectLogger(LocalsInitMiddlware, APP_API_SERVER)
    protected readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async use(
    request: Request,
    response: LocalsResponse,
    next: NextFunction,
  ): Promise<void> {
    this.initPermissions(response);
    next();
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected initPermissions(response: LocalsResponse): void {
    response.locals.permissions = {
      admin: false,
      all: false,
      own: false,
      self: false,
    };
  }

  // #endregion Protected Methods
}
