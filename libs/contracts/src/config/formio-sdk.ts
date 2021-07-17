import {
  APP_API_SERVER,
  APP_DEVTOOLS,
  APP_SQL_CONNECTOR,
  APP_SUPPORT_TOOLS,
  LIB_FORMIO_SDK,
} from '../constants';
import { CreateAnnotation } from '../decorators';

const UsesConfig = CreateAnnotation(LIB_FORMIO_SDK.description);

export class FormioSDKConfig {
  // #region Object Properties

  /**
   * Best used when the calling service needs access to more than one project
   */
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'default',
    },
    default: 'https://api.form.io',
    type: 'url',
  })
  public PORTAL_BASE_URL?: string;
  /**
   * Provide a globally usable api key
   *
   * Useful for some applications, and script consumers
   */
  @UsesConfig({
    applications: {
      [APP_DEVTOOLS.description]: 'default',
      [APP_SQL_CONNECTOR.description]: 'default',
    },
  })
  public API_KEY?: string;
  /**
   * Takes precedence over PORTAL_BASE_URL.
   * Found as live endpoint
   */
  @UsesConfig({
    applications: {
      [APP_SUPPORT_TOOLS.description]: 'default',
      [APP_SQL_CONNECTOR.description]: 'default',
      [APP_DEVTOOLS.description]: 'default',
    },
    type: 'url',
  })
  public PROJECT_URL?: string;
  /**
   * Log in, then provide jwt-token as if signed in user
   *
   * Useful for some applicatins, and script consumers
   */
  @UsesConfig({
    applications: {
      [APP_SUPPORT_TOOLS.description]: 'default',
    },
    library: LIB_FORMIO_SDK.description,
    type: 'string',
  })
  public AUTH_EMAIL: string;
  /**
   * Log in, then provide jwt-token as if signed in user
   *
   * Useful for some applicatins, and script consumers
   */
  @UsesConfig({
    applications: {
      [APP_SUPPORT_TOOLS.description]: 'default',
    },
    type: 'password',
  })
  public AUTH_PASSWORD: string;

  /**
   * Default project to send all requests to
   *
   * Project name
   */
  public BASE_PROJECT?: string;

  // #endregion Object Properties
}

export const API_KEY = 'libs.formiosdk.API_KEY';
export const BASE_PROJECT = 'libs.formiosdk.BASE_PROJECT';
export const PORTAL_BASE_URL = 'libs.formiosdk.PORTAL_BASE_URL';
export const PROJECT_URL = 'libs.formiosdk.PROJECT_URL';
export const AUTH_EMAIL = 'libs.formiosdk.AUTH_EMAIL';
export const AUTH_PASSWORD = 'libs.formiosdk.AUTH_PASSWORD';
