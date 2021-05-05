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
import { NextFunction, Request, Response, Router } from 'express';
import { InjectKnex, Knex } from 'nestjs-knex';
import { PinoLogger } from 'nestjs-pino';
import { get } from 'object-path';

import {
  ConnectorRoute,
  ConnectorRouteDTO,
  ConnectorTags,
  MysqlResult,
  PostgresResult,
} from '../../typings';

@Injectable()
export class AppService {
  // #region Public Static Methods

  public static Middleware(appService: AppService) {
    return function (
      request: Request,
      response: Response,
      next: NextFunction,
    ): void {
      appService.router(request, response, next);
    };
  }

  // #endregion Public Static Methods

  // #region Object Properties

  public router: Router;

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

  // #region Public Methods

  public async refresh(): Promise<void> {
    this.router = Router();
    await this.buildRoutes();
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected async buildRoutes(): Promise<void> {
    const routes = await this.loadRoutes();
    routes.forEach(({ data: route }) => {
      this.router[route.method](
        route.endpoint,
        async (request: Request, response: Response) => {
          response.json(await this.processQuery(route.query, request));
        },
      );
    });
  }

  @Trace()
  protected async processQuery(
    queries: string[][],
    request: Request,
  ): Promise<unknown> {
    // Example queries
    // [
    //   ["INSERT INTO customers (firstName, lastName, email) VALUES (?, ?, ?);", "body.firstName", "body.lastName", "body.email"],
    //   ["SELECT * FROM customers WHERE id=SCOPE_IDENTITY();"]
    // ]
    //
    // Using for loop to force sync order with async operations
    let returnResult: unknown;
    // eslint-disable-next-line no-loops/no-loops
    for (const list of queries) {
      const queryString = list.shift();
      const parameters: string[] = list.map((path) => get(request, path));
      const result = await this.knex.raw<PostgresResult | MysqlResult>(
        queryString,
        parameters,
      );
      switch (this.knex.client.config.client as KNEX_CONNECTION_TYPES) {
        case KNEX_CONNECTION_TYPES.postgresql:
          returnResult = (result as PostgresResult).rows;
          break;
        case KNEX_CONNECTION_TYPES.mysql:
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
          // Hope for the best?
          // mssql works here
          returnResult = result;
      }
    }
    return returnResult;
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private async loadConfigRoutes(): Promise<ConnectorRouteDTO[]> {
    const routes = this.configService.get<ConnectorRoute[]>('routes') || [];
    return routes.map((route) => {
      return {
        data: route,
        form: undefined,
      };
    });
  }

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
      return (
        tags.includes(ConnectorTags.sqlconnector) &&
        tags.includes(ConnectorTags.route)
      );
    });
    const out: ConnectorRouteDTO[] = [];
    await Promise.all(
      routesForms.map(async (form) => {
        const routes = await this.submissionService.list<ConnectorRouteDTO>({
          form,
        });
        routes.forEach((route) => out.push(route));
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

  @Trace()
  private async onApplicationBootstrap() {
    await this.refresh();
  }

  // #endregion Private Methods
}
