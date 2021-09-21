import { AutoLogService, storage, Store } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import express from 'express';
import pino from 'pino';

import { APIRequest, APIResponse } from '../contracts';

const START_TIME = Symbol('startTime');
@Injectable()
export class RequestLoggerService {
  constructor(private readonly logger: AutoLogService) {}

  public middleware() {
    return function (
      request: APIRequest,
      response: APIResponse,
      next: express.NextFunction,
    ): void {
      const logger = AutoLogService.logger as pino.Logger;
      response.locals ??= {};
      // response.locals.logger = logger.child();
      response.on('error', onFinish);
      response.on('finish', onFinish);
      storage.run(new Store(request.logger), () => next());
    };
  }
}

function onFinish(this: APIResponse, error) {
  this.removeListener('error', onFinish);
  this.removeListener('finish', onFinish);

  const log = this.locals.logger;
  const responseTime = Date.now() - this[START_TIME];

  if (error || this.err || this.statusCode >= 500) {
    log.error(
      {
        error:
          error ||
          this.err ||
          new Error('failed with status code ' + this.statusCode),
        res: this,
        responseTime: responseTime,
      },
      `Request errored`,
    );
    return;
  }

  log.info(
    {
      res: this,
      responseTime: responseTime,
    },
    `Response completed`,
  );
}
