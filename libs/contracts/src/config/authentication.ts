import { LIB_AUTHENTICATION } from '..';
import { CreateConfigurableAnnotation } from '../decorators';
/**
 * Encryption key for x-jwt-token
 */
export const JWT_SECRET = 'libs.authentication.JWT_SECRET';
/**
 * How long to sign JWT tokens for
 */
export const EXPIRES_IN = 'libs.authentication.EXPIRES_IN';
export const AUTHENTICATION_CONFIG = 'libs.authentication';
export const BASIC_PASSWORD = 'libs.authentication.BASIC_PASSWORD';
export const BASIC_USERNAME = 'libs.authentication.BASIC_USERNAME';
export const VERIFY_JWT = 'libs.authentication.VERIFY_JWT';

export const DEFAULT_BASIC_PASSWORD = 'changeme';
export const DEFAULT_BASIC_USERNAME = 'changeme';
const DEFAULT_JWT_SECRET = 'changeme';
const DEFAULT_EXPIRES_IN = 1000;
const DEFAULT_VERIFY_JWT = false;

const ConfigurableProperty = CreateConfigurableAnnotation(
  LIB_AUTHENTICATION.description,
);
export class AuthenticationConfig {
  // #region Object Properties

  /**
   * For containers that use basic auth
   */
  @ConfigurableProperty({
    applications: {},
    default: DEFAULT_BASIC_PASSWORD,
    type: 'password',
  })
  public BASIC_PASSWORD?: string;
  /**
   * For containers that use basic auth
   */
  @ConfigurableProperty({
    applications: {},
    default: DEFAULT_BASIC_USERNAME,
    type: 'string',
  })
  public BASIC_USERNAME?: string;
  /**
   * JWT expiry time in minutes
   */
  @ConfigurableProperty({
    applications: {},
    default: DEFAULT_EXPIRES_IN,
    type: 'number',
  })
  public EXPIRES_IN?: number;
  /**
   * Secret for signing jwt tokens
   */
  @ConfigurableProperty({
    applications: {},
    default: DEFAULT_JWT_SECRET,
    type: 'password',
  })
  public JWT_SECRET?: string;
  /**
   * For x-jwt-token headers, decode the token, or decode + verify
   *
   * Defaults to true / verify. Not recommended to turn off
   */
  @ConfigurableProperty({
    applications: {},
    default: DEFAULT_VERIFY_JWT,
    type: 'boolean',
  })
  public VERIFY_JWT?: boolean;

  // #endregion Object Properties
}
