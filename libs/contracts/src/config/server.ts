import { APP_HOME_CONTROLLER, LIB_SERVER } from '..';
import { CreateConfigurableAnnotation } from '../decorators';

const UsesConfig = CreateConfigurableAnnotation(LIB_SERVER.description);
export class ServerConfig {
  // #region Object Properties

  /**
   * For binding http server
   */
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
    },
    default: 3000,
    type: 'number',
  })
  public PORT?: number;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
    },
    type: 'boolean',
  })
  public COMPRESSION?: boolean;
  /**
   * Prefix for all routes
   */
  /**
   * Cache server
   */
  @UsesConfig({
    applications: {},
    default: '',
    type: 'string',
  })
  public GLOBAL_PREFIX?: string;
  /**
   * Default value: "*"
   *
   * Used with configuring application cors libraries
   */
  @UsesConfig({
    applications: {},
    default: '*',
    type: 'string',
  })
  public CORS?: string;
  /**
   * Configuration for helmet
   */

  /**
   * Cache server
   */
  @UsesConfig({
    applications: {},
    default: '*',
    type: 'string',
  })
  public HELMET?: false | Record<string, unknown>;
  /**
   * Body parsing max size
   */
  @UsesConfig({
    applications: {},
    default: '100mb',
    type: 'string',
  })
  public BODY_SIZE?: string;
  /**
   * Http request throttling (IP + route)
   */
  /**
   * Cache server
   */
  @UsesConfig({
    applications: {},
    default: 1000,
    type: 'number',
  })
  public THROTTLE_LIMIT?: number;
  /**
   * Http request throttling (IP + route)
   */
  @UsesConfig({
    applications: {},
    default: 60,
    type: 'number',
  })
  public THROTTLE_TTL?: number;
  @UsesConfig({
    applications: {},
    type: 'password',
  })
  public ADMIN_KEY?: string;

  // #endregion Object Properties
}

export const ADMIN_KEY = `libs.${LIB_SERVER.description}.ADMIN_KEY`;
export const COMPRESSION = `libs.${LIB_SERVER.description}.COMPRESSION`;

export const THROTTLE_LIMIT = `libs.${LIB_SERVER.description}.THROTTLE_LIMIT`;
export const THROTTLE_TTL = `libs.${LIB_SERVER.description}.THROTTLE_TTL`;
export const CORS = `libs.${LIB_SERVER.description}.CORS`;
export const BODY_SIZE = `libs.${LIB_SERVER.description}.BODY_SIZE`;
export const HELMET = `libs.${LIB_SERVER.description}.HELMET`;
export const PORT = `libs.${LIB_SERVER.description}.PORT`;
export const GLOBAL_PREFIX = `libs.${LIB_SERVER.description}.GLOBAL_PREFIX`;
