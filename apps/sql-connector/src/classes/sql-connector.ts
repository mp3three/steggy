import cors from 'cors';
import { Request, Response } from 'express';
import express from 'express';
import Knex from 'knex';
import { AnyKindOfDictionary } from 'lodash';
import Resquel from 'resquel';
import { v4 as uuid } from 'uuid';

import Config, { SQLConnectorConfig, SQLConnectorRoute } from './config';
import logger from './log';
const { log, warn, debug, error } = logger('sql-connector');

export declare interface ResLocals {
  // #region Object Properties

  queries?: {
    queryString: string;
    params: unknown[];
    result: AnyKindOfDictionary[];
  }[];
  requestId?: string;
  result: AnyKindOfDictionary[];
  route?: SQLConnectorRoute;
  status?: number;

  // #endregion Object Properties
}

// Built to be extended and used as a class as well as a service
// To use as a service, view example configuration in docker-compose.yaml
// All environment variables listed there
export class SQLConnector extends Resquel {
  // #region Static Properties

  // I tried to warn you!
  // Easy off button for your configuration validation woes.
  public static BYPASS_CONFIG_VALIDATION =
    (process.env.BYPASS_CONFIG_VALIDATION || false).toString() === 'true';
  // -1 to disable
  public static HOOK_TIMEOUT = Number(process.env.HOOK_TIMEOUT || 1000 * 30);
  public static REFRESH_ROUTE = (
    process.env.REFRESH_ROUTE || '/sqlconnector/refresh'
  ).toString();
  public static ROUTE_INFO_MAX_RETRIES = Number(
    process.env.ROUTE_INFO_MAX_RETRIES || 50,
  );

  // #endregion Static Properties

  // #region Object Properties

  public config: SQLConnectorConfig = null;

  protected knexConnections: Record<string, Knex> = {};

  // #endregion Object Properties

  // #region Constructors

  constructor(private sourceConfig: SQLConnectorConfig) {
    super(null);
  }

  // #endregion Constructors

  // #region Public Methods

  /**
   * 🪄 Set up new routes without defining them in the config! 🪄
   */
  public async addRoute(route: SQLConnectorRoute): Promise<void> {
    const method = route.method.toLowerCase();
    log(`Adding route: ${method} ${route.endpoint}`);
    this.router[method](
      route.endpoint,
      async (request: Request, res: Response) => {
        const locals = res.locals as ResLocals;
        locals.requestId = (request.query.requestId || uuid()) as string;
        locals.route = route;
        log(`[${locals.requestId}] ${route.method} ${route.endpoint}`);

        await this.runHook(route, 'before', request, res);

        // Mental note -
        // If a non-blocking mode is required later, add code here to send a response here to close http
        // If desired, it is valid to send a response from route.before
        //

        const knexClient = await this.getKnex(route);
        if (knexClient === null) {
          // This should have really been caught in validation
          // Did someone delete a connection post-init or something?
          error(`knex client does not exist for ${route.db}`);
          debug(route);
          return;
        }
        const result = await this.processRouteQuery(
          route.query,
          request,
          knexClient,
        );
        if (typeof result === 'number') {
          this.sendError(
            res,
            'processRouteQuery failed, did you send all the needed args for the query? See error logs for details',
            result,
          );
          return;
        }

        locals.result = result;
        await this.runHook(route, 'after', request, res);

        // Don't send responses if a route handler did
        if (res.writableEnded) {
          log(`[${locals.requestId}] Response sent by route hook`);
          return;
        }
        log(`[${locals.requestId}] Sending result`);
        this.sendResponse(res);
      },
    );
  }

  public attach(app: express.Application) {
    app.use((request, res, next) => {
      this.router(request, res, next);
    });
  }

  /**
   * Retrieve Knex connection via route
   *
   * Possible feature expansions:
   *  - Mapping request method to certain databases (GET goes to read db, POST goes to write, etc)
   */
  public async getKnex(route: SQLConnectorRoute): Promise<Knex | null> {
    const connectionName = route.db || 'default';
    return this.knexConnections[connectionName] || null;
  }

  // Calling init will remove the current db connections & router, then re-make them
  // If providing routes from a resource, a webhook can be set up to automatically update the connector by calling the route
  public async init(): Promise<void> {
    log(`Connector init`);
    await this.buildConfig();
    await super.init();
    warn(
      `Call route to reload connector config: ${SQLConnector.REFRESH_ROUTE}`,
    );
    this.router.get(SQLConnector.REFRESH_ROUTE, (request, res) => {
      warn('SQLConnector refresh');
      res.send({
        refresh: true,
      });
      this.init();
    });
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected async buildConfig(): Promise<void> {
    const config = new Config(this.sourceConfig);
    await config.build();
    this.config = config.configData;
  }

  protected createKnexConnections(): void {
    if (Object.keys(this.knexConnections)) {
      warn(`Purging old connections`);
      this.knexConnections = {};
    }
    Object.keys(this.sourceConfig.db).forEach((key) => {
      warn(
        `Creating knex connection for: ${key} (${this.sourceConfig.db[key].client})`,
      );
      this.knexConnections[key] = Knex(this.sourceConfig.db[key]);
    });
  }

  protected loadRoutes(): void {
    this.sourceConfig.routes.forEach((route) => this.addRoute(route));
  }

  protected routerSetup(): void {
    super.routerSetup(this.sourceConfig.app.auth);
    this.router.use(cors(this.sourceConfig.app.cors));
  }

  protected async runHook(
    route: SQLConnectorRoute,
    hook: 'before' | 'after',
    request: Request,
    res: Response,
  ): Promise<void> {
    const locals = res.locals as ResLocals;
    if (route[hook]) {
      return new Promise((done) => {
        let timeout: NodeJS.Timeout | true = true;
        if (SQLConnector.HOOK_TIMEOUT !== -1) {
          timeout = setTimeout(() => {
            done();
            timeout = null;
            error(
              `[${locals.requestId}] ERROR: route.${hook} took longer than ${
                SQLConnector.HOOK_TIMEOUT / 1000
              } seconds`,
            );
          }, SQLConnector.HOOK_TIMEOUT);
        }
        route.before(request, res, async () => {
          if (timeout !== null) {
            if (timeout !== true) {
              clearTimeout(timeout);
            }
            timeout = null;
            done();
            return;
          }
          // Well that's weird. You can update HOOK_TIMEOUT to modify
          //
          error(
            `[${locals.requestId}] route.${hook} returned, but after timeout expired`,
          );
        });
      });
    }
  }

  // #endregion Protected Methods
}
export default SQLConnector;
