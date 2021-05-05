import { APP_SQL_CONNECTOR } from '@automagical/contracts/constants';
import {
  FormioSdkService,
  FormService,
  SubmissionService,
} from '@automagical/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, Router } from 'express';
import knex from 'knex';
import { InjectKnex, Knex } from 'nestjs-knex';
import { PinoLogger } from 'nestjs-pino';

import { ConnectorRoute, ConnectorRouteDTO } from '../../typings';
export class Locals {
  // #region Object Properties

  queries?: {
    queryString: string;
    params: unknown[];
    result: Record<string, unknown>[];
  }[];
  public result: Record<string, unknown>[];
  route?: ConnectorRoute;
  status?: number;

  // #endregion Object Properties
}

@Injectable()
export class AppService {
  // #region Object Properties

  public readonly router = Router();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(AppService, APP_SQL_CONNECTOR)
    private readonly logger: PinoLogger,
    @InjectKnex() private readonly knex: Knex,
    private readonly configService: ConfigService,
    private readonly formioSdkService: FormioSdkService,
    private readonly formService: FormService,
    private readonly submissionService: SubmissionService,
  ) {}

  // #endregion Constructors

  // #region Protected Methods

  @Trace()
  protected async buildRoutes(): Promise<void> {
    const routes = await this.loadRoutes();
    routes.forEach(({ data: route }) => {
      this.router[route.method](
        route.endpoint,
        async (request: Request, response: Response<unknown>) => {
          const locals = response.locals as Locals;
          locals.route = route;
          const result = await this.processQuery(route.query, request);
          if (typeof result === 'number') {
            this.sendError(
              response,
              'processRouteQuery failed, did you send all the needed args for the query? See error logs for details',
              result,
            );
            return;
          }
          locals.result = result;
          await this.runHook(route, 'after', request, response);
          // Don't send responses if a route handler did
          if (response.writableEnded) {
            log(`[${locals.requestId}] Response sent by route hook`);
            return;
          }
          log(`[${locals.requestId}] Sending result`);
          this.sendResponse(response);
        },
      );
      return;
    });
  }

  @Trace()
  protected async processQuery(
    queries: string[][],
    lookup: Record<string, unknown>,
  ): Promise<void> {
    // Example query
    // [
    //   ["INSERT INTO customers (firstName, lastName, email) VALUES (?, ?, ?);", "body.firstName", "body.lastName", "body.email"],
    //   "SELECT * FROM customers WHERE id=SCOPE_IDENTITY();"
    // ]
    //

    // Using for loop to force sync order with async operations
    // eslint-disable-next-line no-loops/no-loops
    for (const list of queries) {
      const parameters: string[] = [];
      list.forEach((element) => {
        const value = _.get(request, element as string);

        parameters.push(value);
      });
      // params builder
      // for (const element_ of query) {
      //   if (typeof element_ === 'string') {
      //     const value = _.get(request, element_ as string);
      //     if (value === undefined) {
      //       log(
      //         `[${res.locals.requestId}] lookup failed for param "${element_}"`,
      //       );
      //       debug(request.body);
      //       return ErrorCodes.paramLookupFailed;
      //     }
      //     parameters.push(value);
      //   }
      // } // /params builder
    }

    let result: AnyKindOfDictionary[] = null;
    for (const element of routeQuery) {
      const query = [...(element as PreparedQuery)];
      const queryString = query.shift() as string;
      const parameters: string[] = [];

      // params builder
      for (const element_ of query) {
        if (typeof element_ === 'string') {
          const value = _.get(request, element_ as string);
          if (value === undefined) {
            log(
              `[${res.locals.requestId}] lookup failed for param "${element_}"`,
            );
            debug(request.body);
            return ErrorCodes.paramLookupFailed;
          }
          parameters.push(value);
        } else {
          parameters.push(
            await (element_ as QueryParamLookup)({
              knex: knexClient,
              req: request,
              res,
              resquel: this,
            }),
          );
        }
      } // /params builder
      try {
        result = this.resultProcess(
          knexClient,
          await knexClient.raw(queryString, parameters),
        );
      } catch (error_) {
        error('QUERY FAILED');
        error({
          params: parameters,
          queryString,
          result,
        });
        error(error_);
        continue;
      }
      // Example result:
      // [
      //   {
      //     id: 1,
      //     firstName: 'John',
      //     lastName: 'Doe',
      //     email: 'example@example.com',
      //   },
      // ];
      //
      // Example prepared query that utilizes result:
      // ["SELECT * FROM customer WHERE id=?", "res.locals.queries[0].id"]
      //
      // This works because `req.res` is a thing:
      // express: After middleware.init executed, Request will contain res and next properties
      // See: express/lib/middleware/init.js
      //

      queries.push({
        params: parameters,
        queryString,
        result,
      });
    }
    return {
      rows: result,
    };
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private async loadProjectRoutes(): Promise<ConnectorRouteDTO[]> {
    return await this.formioSdkService.fetch({
      url: '/sqlconnector?format=v2',
    });
  }

  @Trace()
  private async loadResourceRoutes(): Promise<ConnectorRouteDTO[]> {
    const forms = await this.formService.list();
    const routesForms = forms.filter((form) => {
      const tags = form.tags || [];
      return tags.includes('sqlconnector') && tags.includes('routes');
    });
    const out: ConnectorRouteDTO[] = [];
    await Promise.all(
      routesForms.map(async (form) => {
        const routes = await this.submissionService.list<ConnectorRouteDTO>({
          form,
        });
        routes.forEach((route) => {
          out.push(route);
        });
      }),
    );
    return out;
  }

  @Trace()
  private async loadRoutes() {
    return [
      ...(await this.loadProjectRoutes()),
      ...(await this.loadResourceRoutes()),
    ];
  }

  // #endregion Private Methods
}
