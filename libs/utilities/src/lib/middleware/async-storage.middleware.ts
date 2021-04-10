import { Injectable, NestMiddleware } from '@nestjs/common';
import { Logger } from '@automagical/logger';
import { v4 } from 'uuid';
// const { AsyncLocalStorage } = require("async_hooks");
import { AsyncLocalStorage } from 'async_hooks';
import { NextFunction, Request, Response } from 'express';

const asyncLocalStorage = new AsyncLocalStorage();

/**
 * Proof of concept code, may get removed
 *
 * @automagical/Logger is the first true indended consumer of AsyncLocalStorage code
 */
@Injectable()
export class AsyncStorageMiddleware implements NestMiddleware {
  // #region Object Properties

  private readonly logger = Logger(AsyncStorageMiddleware);

  // #endregion Object Properties

  // #region Public Methods

  public use(req: Request, res: Response, next: NextFunction): void {
    asyncLocalStorage.run(new Map(), () => {
      const id = v4();
      (asyncLocalStorage.getStore() as Map<string, string>).set(
        'requestId',
        id,
      );
      next();
    });
  }

  // #endregion Public Methods
}
