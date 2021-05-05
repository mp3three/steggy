import { SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { HTTP_Methods } from '@automagical/fetch';
import { Knex } from 'knex';

export class ConnectorRoute {
  // #region Object Properties

  public db?: string;
  public endpoint: string;
  public method: HTTP_Methods;
  public query: string[][];

  // #endregion Object Properties
}

export class FormioConfig {
  // #region Object Properties

  public key: string;
  public project: string;

  // #endregion Object Properties
}

export class ConnectorConfig {
  // #region Object Properties

  public cors: string;
  public database: Record<string, Knex.Config>;
  public formio: FormioConfig;
  public password: string;
  public routes: ConnectorRoute[];
  public username: string;

  // #endregion Object Properties
}

export type ConnectorRouteDTO = SubmissionDTO<ConnectorRoute>;

export enum ConnectorTags {
  sqlconnector = 'sqlconnector',
  route = 'route',
  database = 'database',
}
export type PostgresResult = { rows: Record<string, unknown> };
export type MysqlResult = unknown[];
