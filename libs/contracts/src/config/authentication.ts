import {
  APP_API_SERVER,
  APP_SQL_CONNECTOR,
  LIB_AUTHENTICATION,
} from '../constants';
import { CreateAnnotation } from '../decorators';

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
export const AUTHENTICATION_CONFIG = 'libs.authentication';
export const BASIC_PASSWORD = 'libs.authentication.BASIC_PASSWORD';
export const BASIC_USERNAME = 'libs.authentication.BASIC_USERNAME';
export const VERIFY_JWT = 'libs.authentication.VERIFY_JWT';

export const DEFAULT_BASIC_PASSWORD = 'changeme';
export const DEFAULT_REMOTE_SECRET = 'changeme';
export const DEFAULT_BASIC_USERNAME = 'changeme';
export const DEFAULT_JWT_SECRET = 'changeme';
export const DEFAULT_EXPIRES_IN = 1000;
export const DEFAULT_VERIFY_JWT = false;

const UsesConfig = CreateAnnotation(LIB_AUTHENTICATION.description);
export class AuthenticationConfig {
  // #region Object Properties

  /**
   * JWT expiry time in minutes
   */
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
    },
    default: DEFAULT_EXPIRES_IN,
    type: 'number',
  })
  public EXPIRES_IN?: number;
  /**
   * Secret for signing jwt tokens
   */
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'default',
    },
    default: DEFAULT_JWT_SECRET,
    type: 'password',
  })
  public JWT_SECRET?: string;
  /**
   * Secret for validating on premise environment tokens
   */
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'default',
    },
    default: DEFAULT_REMOTE_SECRET,
    type: 'password',
  })
  public REMOTE_SECRET?: string;
  /**
   * For x-jwt-token headers, decode the token, or decode + verify
   *
   * Defaults to true / verify. Not recommended to turn off
   */
  @UsesConfig({
    applications: {
      [APP_API_SERVER.description]: 'hidden',
    },
    default: DEFAULT_VERIFY_JWT,
    type: 'boolean',
  })
  public VERIFY_JWT?: boolean;
  /**
   * For containers that use basic auth
   */
  @UsesConfig({
    applications: {
      [APP_SQL_CONNECTOR.description]: 'default',
    },
    default: DEFAULT_BASIC_PASSWORD,
    type: 'password',
  })
  public BASIC_PASSWORD?: string;
  /**
   * For containers that use basic auth
   */
  @UsesConfig({
    applications: {
      [APP_SQL_CONNECTOR.description]: 'default',
    },
    default: DEFAULT_BASIC_USERNAME,
  })
  public BASIC_USERNAME?: string;

  // #endregion Object Properties
}
