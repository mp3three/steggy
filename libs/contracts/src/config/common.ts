import type { PinoLogger } from 'nestjs-pino';

import {
  APP_API_SERVER,
  APP_LICENSE_SERVER,
  APP_SQL_CONNECTOR,
  APP_SUPPORT_TOOLS,
} from '../constants';
import { CreateAnnotation } from '../decorators';

const DefaultConfig = CreateAnnotation();
/**
 * The generic top level configuration items that are plausible across all applications
 * Individual applicatins should reference this list before defining their own app config variable
 * Any configuration item that belongs to a library is part of the `libs.*` config section, not this.
 */
export class CommonConfig {
  // #region Object Properties

  /**
   * Lower limit for log levels
   */
  @DefaultConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
      [APP_LICENSE_SERVER.description]: 'available',
      [APP_SQL_CONNECTOR.description]: 'available',
      [APP_SUPPORT_TOOLS.description]: 'available',
    },
    default: 'info',
    enum: ['info', 'warn', 'debug', 'trace'],
    type: 'enum',
  })
  public LOG_LEVEL?: keyof typeof PinoLogger.prototype;
  /**
   * For binding http server
   */
  @DefaultConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
      [APP_LICENSE_SERVER.description]: 'available',
      [APP_SQL_CONNECTOR.description]: 'available',
      [APP_SUPPORT_TOOLS.description]: 'available',
    },
    default: 3000,
    type: 'number',
  })
  public PORT?: number;
  /**
   * For debugging purposes, your config will be printed by default
   *
   * After things seem like they're working, set this to false
   */
  @DefaultConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
      [APP_LICENSE_SERVER.description]: 'available',
      [APP_SQL_CONNECTOR.description]: 'available',
      [APP_SUPPORT_TOOLS.description]: 'available',
    },
    default: false,
    type: 'boolean',
  })
  public SKIP_CONFIG_PRINT?: boolean;
  /**
   * Default value: "*"
   *
   * Used with configuring application cors libraries
   */
  @DefaultConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
    },
    default: '*',
  })
  public CORS?: string;
  /**
   * Body parsing max size
   */
  @DefaultConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
    },
    default: '100mb',
  })
  public BODY_SIZE?: string;
  /**
   * - memory = inside node's memory
   * - redis = external redis server (preferred)
   */
  @DefaultConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
    },
    default: 'redis',
    enum: ['redis', 'memory'],
    type: 'enum',
  })
  public CACHE_PROVIDER?: 'redis' | 'memory';
  /**
   * Cache server
   */
  @DefaultConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
    },
    default: 'redis',
    type: 'number',
  })
  public REDIS_HOST?: string;
  /**
   * Http request throttling (IP + route)
   */
  @DefaultConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
    },
    default: 60,
    type: 'number',
  })
  public THROTTLE_TTL?: number;
  /**
   * Cache server
   */
  @DefaultConfig({
    applications: {
      [APP_API_SERVER.description]: 'available',
    },
    default: 6379,
    type: 'number',
  })
  public REDIS_PORT?: number;

  /**
   * Prefix for all routes
   */
  public GLOBAL_PREFIX?: string;
  /**
   * Configuration for helmet
   */
  public HELMET?: false | Record<string, unknown>;
  /**
   * 🤷‍♂️ This doesn't have a clear usage at runtime anymore
   */
  public NODE_ENV?: string;
  /**
   * Http request throttling (IP + route)
   */
  public THROTTLE_LIMIT?: number;

  // #endregion Object Properties
}
export const LOG_LEVEL = 'LOG_LEVEL';
export const THROTTLE_LIMIT = 'THROTTLE_LIMIT';
export const THROTTLE_TTL = 'THROTTLE_TTL';
export const REDIS_HOST = 'REDIS_HOST';
export const REDIS_PORT = 'REDIS_PORT';
export const CORS = 'CORS';
export const BODY_SIZE = 'BODY_SIZE';
export const HELMET = 'HELMET';
export const PORT = 'PORT';
export const GLOBAL_PREFIX = 'GLOBAL_PREFIX';
export const CACHE_PROVIDER = 'CACHE_PROVIDER';
