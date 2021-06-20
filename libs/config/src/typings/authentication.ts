export class AuthenticationConfig {
  // #region Object Properties

  public BASIC_PASSWORD?: string;
  public BASIC_USERNAME?: string;
  public EXPIRES_IN?: 1000;
  public JWT_SECRET?: string;
  public REMOTE_SECRET?: string;
  public RESTRICT_PROJECT_CREATE?: boolean;

  // #endregion Object Properties
}
/**
 * Encryption key for x-jwt-token
 */
export const JWT_SECRET = 'libs.authentication.JWT_SECRET';
/**
 * How long to sign JWT tokens for
 */
export const EXPIRES_IN = 'libs.authentication.EXPIRES_IN';
/**
 * Encryption key for x-remote-token
 */
export const REMOTE_SECRET = 'libs.authentication.REMOTE_SECRET';
/**
 * Typical portal operations allow for users to create projects and such if they are not part of a team.
 * Setting this to true will disallow project creation / etc unless user is explicitly granted permissions.
 */
export const RESTRICT_PROJECT_CREATE =
  'libs.authentication.RESTRICT_PROJECT_CREATE';
export const AUTHENTICATION_CONFIG = 'libs.authentication';
export const DEFAULT_JWT_SECRET = 'changeme';
export const DEFAULT_REMOTE_SECRET = 'changeme';
export const BASIC_PASSWORD = 'libs.authentication.BASIC_PASSWORD';
export const BASIC_USERNAME = 'libs.authentication.BASIC_USERNAME';
export const DEFAULT_BASIC_PASSWORD = 'changeme';
export const DEFAULT_BASIC_USERNAME = 'changeme';
