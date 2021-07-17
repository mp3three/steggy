import { ResponseLocals } from '@automagical/contracts';
import { LIB_SERVER } from '@automagical/contracts/constants';
import {
  APIRequest,
  APIResponse,
  USERAGENT_HEADER,
} from '@automagical/contracts/server';
import { HTTP_METHODS } from '@automagical/contracts/utilities';
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
    locals.control = queryToControl(request.query as Record<string, string>);
    locals.method = request.method.toLowerCase() as HTTP_METHODS;
    locals.parameters = new Map(Object.entries(request.params));
    locals.roles = new Set([]);
    locals.authenticated = false;
    locals.query = new Map(Object.entries(request.query));
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
