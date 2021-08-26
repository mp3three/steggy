import { APP_DASHBOARD, APP_HOME_CONTROLLER, LIB_UTILS } from '..';
import { CreateConfigurableAnnotation } from '../decorators';

const UsesConfig = CreateConfigurableAnnotation(LIB_UTILS.description);

export class UtilsConfig {
  // #region Object Properties

  @UsesConfig({
    applications: 'available',
    default: 'info',
    type: ['info', 'warn', 'debug', 'trace'],
  })
  public LOG_LEVEL?: 'info' | 'warn' | 'debug' | 'trace';
  @UsesConfig({
    applications: 'available',
    default: true,
    type: 'boolean',
  })
  public LOG_OMIT_CTX_PREFIX: boolean;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
      [APP_DASHBOARD.description]: 'available',
    },
    default: 'localhost',
    type: 'string',
  })
  public MQTT_HOST?: string;
  /**
   * - memory = inside node's memory
   * - redis = external redis server (preferred)
   */
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
      [APP_DASHBOARD.description]: 'available',
    },
    default: 'memory',
    type: ['redis', 'memory'],
  })
  public CACHE_PROVIDER?: 'redis' | 'memory';
  /**
   * Cache server
   */
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
      [APP_DASHBOARD.description]: 'available',
    },
    default: 'redis',
    type: 'number',
  })
  public REDIS_HOST?: string;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
      [APP_DASHBOARD.description]: 'available',
    },
    default: 1883,
    type: 'number',
  })
  public MQTT_PORT?: number;
  /**
   * Cache server
   */
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'available',
      [APP_DASHBOARD.description]: 'available',
    },
    default: 6379,
    type: 'number',
  })
  public REDIS_PORT?: number;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'required',
      [APP_DASHBOARD.description]: 'available',
    },
    // Doesn't seem to cast negative numbers properly when set to number
    type: 'string',
  })
  public LATITUDE?: number;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'required',
      [APP_DASHBOARD.description]: 'available',
    },
    // Doesn't seem to cast negative numbers properly when set to number
    type: 'string',
  })
  public LONGITUDE?: number;
  /**
   * Used with potentially recursive operations such as a save action triggering another save actions
   */
  @UsesConfig({
    applications: {},
    type: 'number',
  })
  public MAX_STASH_DEPTH: number;

  // #endregion Object Properties
}

export const LATITUDE = `libs.${LIB_UTILS.description}.LATITUDE`;
export const LONGITUDE = `libs.${LIB_UTILS.description}.LONGITUDE`;
export const MQTT_HOST = `libs.${LIB_UTILS.description}.MQTT_HOST`;
export const MQTT_PORT = `libs.${LIB_UTILS.description}.MQTT_PORT`;
export const LOG_LEVEL = `libs.${LIB_UTILS.description}.LOG_LEVEL`;
export const REDIS_HOST = `libs.${LIB_UTILS.description}.REDIS_HOST`;
export const CACHE_PROVIDER = `libs.${LIB_UTILS.description}.CACHE_PROVIDER`;
export const REDIS_PORT = `libs.${LIB_UTILS.description}.REDIS_PORT`;
export const LOG_OMIT_CTX_PREFIX = `libs.${LIB_UTILS.description}.LOG_OMIT_CTX_PREFIX`;
export const MAX_STASH_DEPTH = `libs.${LIB_UTILS.description}.MAX_STASH_DEPTH`;
