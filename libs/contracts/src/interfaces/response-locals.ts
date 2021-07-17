import { SessionTokenDTO } from '../libs/authentication';
import { HTTP_METHODS } from '../libs/fetch';
import {
  ActionDTO,
  FormDTO,
  PERMISSION_ACCESS_TYPES,
  ProjectDTO,
  SubmissionDTO,
  UserDTO,
} from '../libs/formio-sdk';
import { LicenseDTO } from '../libs/licenses';
import { ACTION_METHOD } from '../libs/server';
import { CrudOptions } from './crud-options';

export enum ResponseFlags {
  /**
   * Request was authenticated using REMOTE_TOKEN_HEADER
   */
  REMOTE_TOKEN,
  /**
   * Request was authenticated using API_KEY_HEADER
   */
  API_KEY,
  /**
   * Request was authenticated using ADMIN_KEY_HEADER
   */
  ADMIN_KEY,
  /**
   * Request was authenticated using JWT_TOKEN_HEADER
   */
  JWT_TOKEN,
  /**
   * Authentication determined request has admin level access for this request
   */
  ADMIN,
  /**
   * User is project owner
   */
  PROJECT_OWNER,
}
export class LocalStashDTO {
  // #region Object Properties

  public action?: ActionDTO;
  public body?: unknown;
  public form?: FormDTO;
  public project?: ProjectDTO;
  public submission?: SubmissionDTO;

  // #endregion Object Properties
}
export interface ResponseLocals extends CrudOptions {
  // #region Object Properties

  ACTION_TYPE?: ACTION_METHOD;
  action?: ActionDTO;
  /**
   * Did one of the auth guards say no?
   */
  authenticated?: boolean;
  flags: Set<ResponseFlags>;
  /**
   * Form loaded via path params
   */
  headers: Map<string, string>;
  license?: LicenseDTO;
  licenseId?: string;
  licenseList?: LicenseDTO[];
  method: HTTP_METHODS;
  parameters: Map<string, string>;
  projectApiKey?: string;
  query: Map<string, string>;
  remotePermission?: PERMISSION_ACCESS_TYPES;
  roles: Set<string>;
  session?: SessionTokenDTO;
  stash?: LocalStashDTO[];
  submission?: SubmissionDTO;
  user?: UserDTO;

  // #endregion Object Properties
}
