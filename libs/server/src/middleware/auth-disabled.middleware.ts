import { APIRequest, APIResponse } from '@formio/contracts/server';
import { InjectLogger } from '@formio/utilities';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class AuthDisabledMiddleware implements NestMiddleware {
  // #region Constructors

  constructor(
    @InjectLogger(AuthDisabledMiddleware) private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public async use(
    request: APIRequest,
    { locals }: APIResponse,
    next: NextFunction,
  ): Promise<void> {
    locals.authenticated = true;
    next();
  }

  // #endregion Public Methods
}
