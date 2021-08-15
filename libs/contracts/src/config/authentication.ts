import { LIB_AUTHENTICATION } from '..';
import { CreateConfigurableAnnotation } from '../decorators';

/**
 * Encryption key for x-jwt-token
 */
export const JWT_SECRET = 'libs.authentication.JWT_SECRET';
/**
 * How long to sign JWT tokens for
 */
export const EXPIRES_IN = `libs.${LIB_AUTHENTICATION.description}.EXPIRES_IN`;
/**
 * Reference to base config object
 */
export const AUTHENTICATION_CONFIG = `libs.${LIB_AUTHENTICATION.description}`;
/**
 * Password to be used in basic auth middleware
 */
export const BASIC_PASSWORD = `libs.${LIB_AUTHENTICATION.description}.BASIC_PASSWORD`;
/**
 * Username to be used in basic auth middleware
 */
export const BASIC_USERNAME = `libs.${LIB_AUTHENTICATION.description}.BASIC_USERNAME`;
/**
 * Should the signature of the jwt token be verified after decoding?
 *
 * Has security implications to turn off
 */
export const VERIFY_JWT = `libs.${LIB_AUTHENTICATION.description}.VERIFY_JWT`;

export const DEFAULT_BASIC_PASSWORD = 'changeme';
export const DEFAULT_BASIC_USERNAME = 'changeme';
export const DEFAULT_JWT_SECRET = 'changeme';
export const DEFAULT_EXPIRES_IN = 1000;
export const DEFAULT_VERIFY_JWT = true;

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
