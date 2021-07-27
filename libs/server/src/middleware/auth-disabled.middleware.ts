import { APIRequest, APIResponse } from '@automagical/contracts/server';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

@Injectable()
export class AuthDisabledMiddleware implements NestMiddleware {
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
