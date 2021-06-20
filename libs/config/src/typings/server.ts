export class ServerConfig {
  // #region Object Properties

  ADMIN_KEY?: string;
  PROJECT_KEYS?: Record<string, string>;

  // #endregion Object Properties
}

/**
 * Encryption key for x-jwt-token
 */
export const ADMIN_KEY = 'libs.server.ADMIN_KEY';
export const PROJECT_KEYS = 'libs.server.PROJECT_KEYS';
