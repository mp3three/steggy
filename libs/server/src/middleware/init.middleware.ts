import {
  AutoLogService,
  buildFilter,
  FilterDTO,
  FilterValueType,
  HTTP_METHODS,
  InjectConfig,
  queryToControl,
  storage,
  Trace,
} from '@automagical/utilities';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';
import pino from 'pino';

import { MAX_REQUEST_ID } from '../config';
import {
  APIRequest,
  APIResponse,
  QUERY_HEADER,
  ResponseLocals,
  USERAGENT_HEADER,
} from '../contracts';

let currentRequestId = 0;
const OK = 200;
const EMPTY = 0;
const INCREMENT = 1;
/**
 * - Set up defaults on request locals
 * - Generate request id
 */
@Injectable()
export class InitMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: AutoLogService,
    @InjectConfig(MAX_REQUEST_ID) private readonly rollover: number,
  ) {}

  @Trace()
  public use(
    request: APIRequest,
    { locals }: APIResponse,
    next: NextFunction,
  ): void {
    locals.headers ??= new Map(
      Object.entries(request.headers as Record<string, string>),
    );
    if (this.isHealthCheck(locals, request.res)) {
      return;
    }
    currentRequestId = (currentRequestId + INCREMENT) % this.rollover;
    const logger = (AutoLogService.logger as pino.Logger).child({
      id: currentRequestId,
    });

    storage.run(logger, () => {
      locals.flags = new Set();
      locals.auth ??= {};
      locals.start = new Date();
      locals.control = queryToControl(request.query as Record<string, string>);
      locals.method = request.method.toLowerCase() as HTTP_METHODS;
      locals.parameters = new Map(Object.entries(request.params));
      locals.roles = new Set();
      locals.authenticated = false;
      locals.query = new Map(Object.entries(request.query));
      this.mergeQueryHeader(locals);
      next();
    });
  }

  /**
   * Cut off automated health checks.
   *
   * Server identifies as fine, no reason to expend extra resources
   */
  @Trace()
  private isHealthCheck(
    { headers }: ResponseLocals,
    response: APIResponse,
  ): boolean {
    const header = headers.get(USERAGENT_HEADER) ?? '';
    if (header.includes('ELB-HealthChecker')) {
      response.status(OK).send({
        status: 'Ok',
      });
      return true;
    }
    return false;
  }

  @Trace()
  private mergeQueryHeader({ headers, control }: ResponseLocals): void {
    if (!headers.has(QUERY_HEADER)) {
      return;
    }
    const filters = control.filters;
    if (filters.size > EMPTY) {
      this.logger.debug(`Merging ${QUERY_HEADER} into query params`);
    }
    try {
      const query: Record<string, FilterValueType | FilterValueType[]> =
        JSON.parse(headers.get(QUERY_HEADER));
      Object.entries(query).forEach(([key, value]) => {
        let found: FilterDTO;
        filters.forEach((filter) => {
          if (filter.field === key) {
            found = filter;
          }
        });
        if (found) {
          this.logger.warn(
            {
              header: { key, value },
              queryParams: found,
            },
            `Filter conflict`,
          );
          filters.delete(found);
        }
        filters.add(buildFilter(key, value));
      });
    } catch (error) {
      this.logger.error(
        {
          error,
          value: headers.get(QUERY_HEADER),
        },
        `Bad json passed to ${QUERY_HEADER}`,
      );
    }
  }
}
