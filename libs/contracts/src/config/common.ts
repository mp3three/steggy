import { ConfigurableProperty } from '@automagical/utilities';
import type { PinoLogger } from 'nestjs-pino';

/**
 * The generic top level configuration items that are plausible across all applications
 * Individual applicatins should reference this list before defining their own app config variable
 * Any configuration item that belongs to a library is part of the `libs.*` config section, not this.
 */
export class CommonConfig {
  // #region Object Properties

  /**
   * Lower limit for log levels in http messages
   *
   * TODO: Non-request related logging is debug+ (fixme)
   */
  @ConfigurableProperty({
    applications: {},
    default: 'info',
    type: ['info', 'warn', 'debug', 'trace'],
  })
  public LOG_LEVEL?: keyof typeof PinoLogger.prototype;
  /**
   * For binding http server
   */
  @ConfigurableProperty({
    applications: {},
    default: 3000,
    type: 'number',
  })
  public PORT?: number;
  /**
   * For debugging purposes, your config will be printed by default
   *
   * After things seem like they're working, set this to false
   */
  @ConfigurableProperty({
    applications: {},
    default: false,
    type: 'boolean',
  })
  public SKIP_CONFIG_PRINT?: boolean;
  /**
   * Default value: "*"
   *
   * Used with configuring application cors libraries
   */
  @ConfigurableProperty({
    applications: {},
    default: '*',
    type: 'string',
  })
  public CORS?: string;
  /**
   * Body parsing max size
   */
  @ConfigurableProperty({
    applications: {},
    default: '100mb',
    type: 'string',
  })
  public BODY_SIZE?: string;
  /**
   * - memory = inside node's memory
   * - redis = external redis server (preferred)
   */
  @ConfigurableProperty({
    applications: {},
    default: 'memory',
    type: ['redis', 'memory'],
  })
  public CACHE_PROVIDER?: 'redis' | 'memory';
  /**
   * Cache server
   */
  @ConfigurableProperty({
    applications: {},
    default: 'redis',
    type: 'number',
  })
  public REDIS_HOST?: string;
  /**
   * Http request throttling (IP + route)
   */
  @ConfigurableProperty({
    applications: {},
    default: 60,
    type: 'number',
  })
  public THROTTLE_TTL?: number;
  /**
   * Cache server
   */
  @ConfigurableProperty({
    applications: {},
    default: 6379,
    type: 'number',
  })
  public REDIS_PORT?: number;

  /**
   * Prefix for all routes
   */
  /**
   * Cache server
   */
  @ConfigurableProperty({
    applications: {},
    default: '',
    type: 'string',
  })
  public GLOBAL_PREFIX?: string;
  /**
   * Configuration for helmet
   */

  /**
   * Cache server
   */
  @ConfigurableProperty({
    applications: {},
    default: '*',
    type: 'string',
  })
  public HELMET?: false | Record<string, unknown>;
  /**
   * 🤷‍♂️ This doesn't have a clear usage at runtime anymore
   */
  public NODE_ENV?: string;
  /**
   * Http request throttling (IP + route)
   */
  /**
   * Cache server
   */
  @ConfigurableProperty({
    applications: {},
    default: 1000,
    type: 'number',
  })
  public THROTTLE_LIMIT?: number;
  /**
   * Cache server
   */
  @ConfigurableProperty({
    applications: {},
    default: 'localhost',
    type: 'string',
  })
  public MQTT_HOST?: string;
  /**
   * Cache server
   */
  @ConfigurableProperty({
    applications: {},
    default: 1883,
    type: 'number',
  })
  public MQTT_PORT?: string;

  // #endregion Object Properties
}
/**
 * @see {@link CommonConfig#LOG_LEVEL}
 */
export const LOG_LEVEL = 'common.LOG_LEVEL';
export const THROTTLE_LIMIT = 'common.THROTTLE_LIMIT';
export const THROTTLE_TTL = 'common.THROTTLE_TTL';
export const REDIS_HOST = 'common.REDIS_HOST';
export const REDIS_PORT = 'common.REDIS_PORT';
export const CORS = 'common.CORS';
export const BODY_SIZE = 'common.BODY_SIZE';
export const HELMET = 'common.HELMET';
export const PORT = 'common.PORT';
export const GLOBAL_PREFIX = 'common.GLOBAL_PREFIX';
export const CACHE_PROVIDER = 'common.CACHE_PROVIDER';
