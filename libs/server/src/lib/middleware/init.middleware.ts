import { WEBHOOK_USER_AGENT } from '@automagical/contracts/action';
import { EVERYONE_ROLE } from '@automagical/contracts/authentication';
import { LIB_SERVER } from '@automagical/contracts/constants';
import { HTTP_METHODS } from '@automagical/contracts/fetch';
import type { APIRequest, APIResponse } from '@automagical/contracts/server';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { PinoLogger } from 'nestjs-pino';

/**
 * Retreive current user data through a provided JWT_TOKEN header
 *
 * Useful for situatins where you need userdata, but cannot decrypt the JWT. Build at POC code, but may be useful later
 */
@Injectable()
export class InitMiddleware implements NestMiddleware {
  // #region Constructors

  constructor(
    @InjectLogger(InitMiddleware, LIB_SERVER)
    private readonly logger: PinoLogger,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async use(
    request: APIRequest,
    { locals }: APIResponse,
    next: NextFunction,
  ): Promise<void> {
    locals.flags = new Set();
    locals.method = request.method.toLowerCase() as HTTP_METHODS;
    locals.parameters = new Map(Object.entries(request.params));
    locals.roles = new Set([EVERYONE_ROLE]);
    locals.authenticated = false;
    locals.headers = new Map(
      Object.entries(request.headers as Record<string, string>),
    );
    locals.query = new Map(Object.entries(request.query));
    if (locals.headers.get('user-agent') === WEBHOOK_USER_AGENT) {
      // TODO: add depth check to useragent string
      // ex: `${WEBHOOK_USER_AGENT}[-${depth}]`
      // The worry is around an accidental infinite loop of webhooks
      this.logger.warn({ WEBHOOK_USER_AGENT }, 'Request sent by webhook');
    }
    next();
  }

  // #endregion Public Methods
}
