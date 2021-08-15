import { APP_DASHBOARD, APP_HOME_CONTROLLER, LIB_UTILS } from '..';
import { CreateConfigurableAnnotation } from '../decorators';
import { AWSUtilitiesConfig } from './external';

const UsesConfig = CreateConfigurableAnnotation(LIB_UTILS.description);
export class EmailCustomConfig {
  // #region Object Properties

  public url: string;

  // #endregion Object Properties
}

export class EmailGmailConfig {
  // #region Object Properties

  public auth: Record<'user' | 'pass', string>;

  // #endregion Object Properties
}

export class EmailSendgridConfig {
  // #region Object Properties

  public auth: Record<'api_user' | 'api_key', string>;

  // #endregion Object Properties
}

export class EmailMandrillConfig {
  // #region Object Properties

  public auth: Record<'apiKey', string>;

  // #endregion Object Properties
}

export class EmailMailgunConfig {
  // #region Object Properties

  public auth: Record<'api_key', string>;

  // #endregion Object Properties
}

export class EmailSMTPConfig {
  // #region Object Properties

  public allowUnauthorizedCerts?: boolean | string;
  public auth?: Record<'user' | 'pass', string>;
  public host: string;
  public ignoreTLS?: boolean | string;
  public port?: number;
  public secure?: boolean | string;

  // #endregion Object Properties
}

export class EmailConfig {
  // #region Object Properties

  @UsesConfig({
    applications: {},
    type: 'string',
  })
  public EMAIL_DEFAULT_FROM?: string;

  public CHUNK_SIZE?: number;
  public custom?: EmailCustomConfig;
  public gmail?: EmailGmailConfig;
  public mailgun?: EmailMailgunConfig;
  public mandrill?: EmailMandrillConfig;
  public sendgrid?: EmailSendgridConfig;
  public smtp?: EmailSMTPConfig;

  // #endregion Object Properties
}

export class UtilsConfig {
  // #region Object Properties

  @UsesConfig({
    applications: 'available',
    default: 'info',
    type: ['info', 'warn', 'debug', 'trace'],
  })
  public LOG_LEVEL?: 'info' | 'warn' | 'debug' | 'trace';
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
      [APP_HOME_CONTROLLER.description]: 'default',
      [APP_DASHBOARD.description]: 'available',
    },
    // Doesn't seem to cast negative numbers properly when set to number
    type: 'string',
  })
  public LATITUDE?: number;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'default',
      [APP_DASHBOARD.description]: 'available',
    },
    // Doesn't seem to cast negative numbers properly when set to number
    type: 'string',
  })
  public LONGITUDE?: number;
  @UsesConfig({
    applications: {},
    type: 'number',
  })
  public CHUNK_SIZE?: number;
  /**
   * Used with potentially recursive operations such as a save action triggering another save actions
   */
  @UsesConfig({
    applications: {},
    type: 'number',
  })
  public MAX_STASH_DEPTH: number;
  @UsesConfig({
    applications: {},
    type: 'string',
  })
  public EMAIL_DEFAULT_FROM?: string;
  /**
   *
   */
  @UsesConfig({
    applications: {},
    type: {
      reference: AWSUtilitiesConfig,
    },
  })
  public AWS?: AWSUtilitiesConfig;
  @UsesConfig({
    applications: {},
    type: {
      reference: EmailConfig,
    },
  })
  public email?: EmailConfig;

  // #endregion Object Properties
}

export const MAX_STASH_DEPTH = 'libs.utils.MAX_STASH_DEPTH';
export const EMAIL_CUSTOM_CONFIG = `libs.${LIB_UTILS.description}.email.custom`;
export const EMAIL_GMAIL_CONFIG = `libs.${LIB_UTILS.description}.email.gmail`;
export const EMAIL_MAILGUN_CONFIG = `libs.${LIB_UTILS.description}.email.mailgun`;
export const EMAIL_MANDRILL_CONFIG = `utils.${LIB_UTILS.description}.email.mandrill`;
export const EMAIL_SENDGRID_CONFIG = `libs.${LIB_UTILS.description}.email.sendgrid`;
export const EMAIL_SMTP_CONFIG = `libs.${LIB_UTILS.description}.email.smtp`;
export const EMAIL_DEFAULT_FROM = `libs.${LIB_UTILS.description}.email.EMAIL_DEFAULT_FROM`;
export const EMAIL_CHUNK_SIZE = `libs.${LIB_UTILS.description}.email.CHUNK_SIZE`;
export const AWS_CONFIG = `libs.${LIB_UTILS.description}.AWS`;
export const LATITUDE = `libs.${LIB_UTILS.description}.LATITUDE`;
export const LONGITUDE = `libs.${LIB_UTILS.description}.LONGITUDE`;
export const MQTT_HOST = `libs.${LIB_UTILS.description}.MQTT_HOST`;
export const MQTT_PORT = `libs.${LIB_UTILS.description}.MQTT_PORT`;
export const LOG_LEVEL = `libs.${LIB_UTILS.description}.LOG_LEVEL`;
export const REDIS_HOST = `libs.${LIB_UTILS.description}.REDIS_HOST`;
export const CACHE_PROVIDER = `libs.${LIB_UTILS.description}.CACHE_PROVIDER`;
export const REDIS_PORT = `libs.${LIB_UTILS.description}.REDIS_PORT`;
