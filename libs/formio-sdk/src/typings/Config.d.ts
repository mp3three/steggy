export type SDKDeploymentType = 'hosted' | 'remote';

export type SDKConfig = Readonly<{
  /**
   * Root URL for the portal
   *
   * Example: https://portal.form.io
   */
  PORTAL_BASE_URL: string;

  /**
   * Root URL for the license server
   *
   * Example: https://license.form.io
   */
  LICENSE_SERVER_BASE_URL?: string;

  /**
   * The email you use to log in
   */
  LOGIN_EMAIL?: string;

  /**
   * The password you use to log in
   */
  LOGIN_PASSWORD?: string;

  /**
   * Valid API key for the email
   */
  API_KEY?: string;

  /**
   * Basic auth configuration for when the portal wants to send messages back
   */
  AUTH?: {
    user: string;
    password: string;
  };
}>;
