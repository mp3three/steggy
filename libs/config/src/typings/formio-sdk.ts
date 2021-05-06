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
  public LICENSE_SERVER?: string;
  public PORTAL_BASE_URL?: string;
  public PROJECT_URL?: string;

  // #endregion Object Properties
}
