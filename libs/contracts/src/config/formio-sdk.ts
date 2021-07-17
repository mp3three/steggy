import { CreateConfigurableAnnotation } from '@automagical/utilities';

import { LIB_FORMIO_SDK } from '../constants';

const UsesConfig = CreateConfigurableAnnotation(LIB_FORMIO_SDK.description);

export class FormioSDKConfig {
  // #region Object Properties

  /**
   * Best used when the calling service needs access to more than one project
   */
  @UsesConfig({
    applications: {},
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
    applications: {},
    default: '',
    type: 'string',
  })
  public API_KEY?: string;
  /**
   * Takes precedence over PORTAL_BASE_URL.
   * Found as live endpoint
   */
  @UsesConfig({
    applications: {},
    default: '',
    type: 'url',
  })
  public PROJECT_URL?: string;
  /**
   * Log in, then provide jwt-token as if signed in user
   *
   * Useful for some applicatins, and script consumers
   */
  @UsesConfig({
    applications: {},
    default: '',
    type: 'string',
  })
  public AUTH_EMAIL: string;
  /**
   * Log in, then provide jwt-token as if signed in user
   *
   * Useful for some applicatins, and script consumers
   */
  @UsesConfig({
    applications: {},
    default: '',
    type: 'password',
  })
  public AUTH_PASSWORD: string;

  /**
   * Default project to send all requests to.
   *
   * Project name
   */
  public BASE_PROJECT?: string;

  // #endregion Object Properties
}

export const API_KEY = `libs.${LIB_FORMIO_SDK.description}.API_KEY`;
export const BASE_PROJECT = `libs.${LIB_FORMIO_SDK.description}.BASE_PROJECT`;
export const PORTAL_BASE_URL = `libs.${LIB_FORMIO_SDK.description}.PORTAL_BASE_URL`;
export const PROJECT_URL = `libs.${LIB_FORMIO_SDK.description}.PROJECT_URL`;
export const AUTH_EMAIL = `libs.${LIB_FORMIO_SDK.description}.AUTH_EMAIL`;
export const AUTH_PASSWORD = `libs.${LIB_FORMIO_SDK.description}.AUTH_PASSWORD`;
