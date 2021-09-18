import {
  AutoLogService,
  buildFilter,
  FilterDTO,
  FilterValueType,
  HTTP_METHODS,
  queryToControl,
  Trace,
} from '@automagical/utilities';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction } from 'express';

import {
  APIRequest,
  APIResponse,
  QUERY_HEADER,
  ResponseLocals,
  USERAGENT_HEADER,
} from '../contracts';

/**
 * Retreive current user data through a provided JWT_TOKEN header
 *
 * Useful for situations where you need userdata, but cannot decrypt the JWT. Build at POC code, but may be useful later
 */
@Injectable()
export class InitMiddleware implements NestMiddleware {
  constructor(private readonly logger: AutoLogService) {}

  @Trace()
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
    locals.flags = new Set();
    locals.auth ??= {};
    locals.control = queryToControl(request.query as Record<string, string>);
    locals.method = request.method.toLowerCase() as HTTP_METHODS;
    locals.parameters = new Map(Object.entries(request.params));
    locals.roles = new Set();
    locals.authenticated = false;
    locals.query = new Map(Object.entries(request.query));

    this.mergeQueryHeader(locals);
    next();
  }

  /**
   * Cut off automated health checks.
   *
   * Server identifies as fine, no reason to expend extra resources
   */
  @Trace()
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

  @Trace()
  private mergeQueryHeader(locals: ResponseLocals): void {
    if (!locals.headers.has(QUERY_HEADER)) {
      return;
    }
    const filters = locals.control.filters;
    if (filters.size > 0) {
      this.logger.debug(`Merging ${QUERY_HEADER} into query params`);
    }
    try {
      const query: Record<string, FilterValueType | FilterValueType[]> =
        JSON.parse(locals.headers.get(QUERY_HEADER));
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
          value: locals.headers.get(QUERY_HEADER),
        },
        `Bad json passed to ${QUERY_HEADER}`,
      );
    }
  }
}
