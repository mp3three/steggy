export class FormioSDKPortalAuth {
  // #region Object Properties

  public email: string;
  public password: string;

  // #endregion Object Properties
}
export class FormioSDKConfig {
  // #region Object Properties

  public API_KEY?: string;
  public AUTH?: FormioSDKPortalAuth;
  public BASE_PROJECT?: string;
  /**
   * Best used when the calling service needs access to more than one project
   */
  public PORTAL_BASE_URL?: string;
  /**
   * Takes precedence over PORTAL_BASE_URL
   *
   * Locks all requests into a subdomain project format
   */
  public PROJECT_URL?: string;

  // #endregion Object Properties
}

export const API_KEY = 'libs.formio-sdk.API_KEY';
export const BASE_PROJECT = 'libs.formio-sdk.BASE_PROJECT';
export const PORTAL_BASE_URL = 'libs.formio-sdk.PORTAL_BASE_URL';
export const PROJECT_URL = 'libs.formio-sdk.PROJECT_URL';
export const AUTH_EMAIL = 'libs.formio-sdk.AUTH.email';
export const AUTH_PASSWORD = 'libs.formio-sdk.AUTH.password';
