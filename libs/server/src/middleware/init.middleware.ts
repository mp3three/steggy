import { ResponseLocals } from '@automagical/contracts';
import { WEBHOOK_USER_AGENT } from '@automagical/contracts/action';
import { EVERYONE_ROLE } from '@automagical/contracts/authentication';
import { LIB_SERVER } from '@automagical/contracts/constants';
import { HTTP_METHODS } from '@automagical/contracts/fetch';
import {
  API_KEY_HEADER,
  APIRequest,
  APIResponse,
  JWT_HEADER,
  USERAGENT_HEADER,
} from '@automagical/contracts/server';
import { InjectLogger, queryToControl } from '@automagical/utilities';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import { PinoLogger } from 'nestjs-pino';

/**
 * Retreive current user data through a provided JWT_TOKEN header
 *
 * Useful for situations where you need userdata, but cannot decrypt the JWT. Build at POC code, but may be useful later
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

  public async use(
    request: APIRequest,
    { locals }: APIResponse,
    next: NextFunction,
  ): Promise<void> {
    locals.headers ??= new Map(
      Object.entries(request.headers as Record<string, string>),
    );
    if (this.isHealthCheck(locals, request.res)) {
      return;
    }
    // This just causes issues
    delete request.query.live;
    locals.flags = new Set();
    locals.auth ??= {};
    locals.auth.apiKey =
      locals.headers.get(API_KEY_HEADER) ?? locals.auth.apiKey;
    locals.auth.jwtToken ??= locals.headers.get(JWT_HEADER);
    locals.control = queryToControl(request.query as Record<string, string>);
    locals.method = request.method.toLowerCase() as HTTP_METHODS;
    locals.parameters = new Map(Object.entries(request.params));
    locals.roles = new Set([EVERYONE_ROLE]);
    locals.authenticated = false;
    locals.query = new Map(Object.entries(request.query));
    if (locals.headers.get(USERAGENT_HEADER) === WEBHOOK_USER_AGENT) {
      // TODO: add depth check to useragent string
      // ex: `${WEBHOOK_USER_AGENT}[-${depth}]`
      // The worry is around an accidental infinite loop of webhooks
      this.logger.warn({ WEBHOOK_USER_AGENT }, 'Request sent by webhook');
    }
    next();
  }

  // #endregion Public Methods

  // #region Private Methods

  /**
   * Cut off automated health checks.
   *
   * Server identifies as fine, no reason to expend extra resources
   */
  private isHealthCheck(
    locals: ResponseLocals,
    response: APIResponse,
  ): boolean {
    const header = locals.headers.get(USERAGENT_HEADER) ?? '';
    if (header.includes('ELB-HealthChecker')) {
      response.status(200).send({
        status: 'Ok',
      });
      return true;
    }
    return false;
  }

  // #endregion Private Methods
}
