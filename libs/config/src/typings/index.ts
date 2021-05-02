import { FormioSDKConfig } from './formio-sdk';
import { HomeAssistantConfig } from './home-assistant';
export * from './formio-sdk';
export * from './home-assistant';
import { PinoLogger } from 'nestjs-pino';

export class AutomagicalConfig<
  Application extends Record<never, unknown> = Record<never, unknown>
> {
  // #region Object Properties

  /**
   * Body parsing max size
   */
  public BODY_SIZE?: string;
  /**
   * Lower limit for log levels
   */
  public LOG_LEVEL?: keyof typeof PinoLogger.prototype;
  /**
   * 🤷‍♂️
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
  /**
   * Custom stuff for implementations
   */
  public application?: Application;
  /**
   * Libraries
   */
  public libs?: {
    ['formio-sdk']?: FormioSDKConfig;
    ['home-assistant']?: HomeAssistantConfig;
  };

  // #endregion Object Properties
}
