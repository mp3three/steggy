import {
  APP_SQL_CONNECTOR,
  KNEX_CONNECTION_TYPES,
} from '@automagical/contracts/constants';
import {
  FormioSdkService,
  FormService,
  SubmissionService,
} from '@automagical/formio-sdk';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, Router } from 'express';
import { InjectKnex, Knex } from 'nestjs-knex';
import { PinoLogger } from 'nestjs-pino';
import { get } from 'object-path';

import {
  ConnectorRoute,
  ConnectorRouteDTO,
  MysqlResult,
  PostgresResult,
} from '../../typings';
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
  ): Promise<unknown> {
    // Example query
    // [
    //   ["INSERT INTO customers (firstName, lastName, email) VALUES (?, ?, ?);", "body.firstName", "body.lastName", "body.email"],
    //   "SELECT * FROM customers WHERE id=SCOPE_IDENTITY();"
    // ]
    //

    // Using for loop to force sync order with async operations
    let returnResult: unknown;
    // eslint-disable-next-line no-loops/no-loops
    for (const list of queries) {
      const queryString = list.shift();
      const parameters: string[] = list.map((path) => get(lookup, path));
      const result = await this.knex.raw<PostgresResult | MysqlResult>(
        queryString,
        parameters,
      );
      switch (this.knex.client.config.client as KNEX_CONNECTION_TYPES) {
        case 'postgresql':
          returnResult = (result as PostgresResult).rows;
          break;
        case 'mysql':
          if ((result as MysqlResult).length === 1) {
            returnResult = result;
            break;
          }
          if (result[0].affectedRows !== undefined) {
            returnResult = [];
            break;
          }
          returnResult = result[0];
          break;
        default:
          returnResult = result;
      }
    }
    return returnResult;
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
