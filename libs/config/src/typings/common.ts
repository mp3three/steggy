import { PinoLogger } from 'nestjs-pino';

/**
 * The generic top level configuration items that are plausible across all applications
 * Individual applicatins should reference this list before defining their own app config variable
 * Any configuration item that belongs to a library is part of the `libs.*` config section, not this.
 */
export class CommonConfig {
  // #region Object Properties

  /**
   * Body parsing max size
   */
  public BODY_SIZE?: string;
  /**
   * Default value: "*"
   *
   * Used with configuring application cors libraries
   */
  public CORS?: string;
  /**
   * Configuration for helmet
   */
  public HELMET?: false | Record<string, unknown>;
  /**
   * Lower limit for log levels
   */
  public LOG_LEVEL?: keyof typeof PinoLogger.prototype;
  /**
   * mongodb connection uri
   */
  public MONGO?: string;
  /**
   * 🤷‍♂️ This doesn't have a clear usage at runtime anymore
   */
  public NODE_ENV?: string;
  /**
   * For binding http server
   */
  public PORT?: number;
  /**
   * Cache server
   */
  public REDIS_HOST?: string;
  /**
   * Cache server
   */
  public REDIS_PORT?: number;
  /**
   * Http request throttling (IP + route)
   */
  public THROTTLE_LIMIT?: number;
  /**
   * Http request throttling (IP + route)
   */
  public THROTTLE_TTL?: number;

  // #endregion Object Properties
}
