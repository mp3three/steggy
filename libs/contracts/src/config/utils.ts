import { APP_API_SERVER, APP_DEVTOOLS, LIB_UTILS } from '../constants';
import { CreateAnnotation } from '../decorators';
import { AWSUtilitiesConfig } from './external';

const UsesConfig = CreateAnnotation(LIB_UTILS.description);
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
    applications: {
      [APP_API_SERVER.description]: 'available',
    },
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

  /**
   *
   */
  @UsesConfig({
    applications: {
      [APP_DEVTOOLS.description]: 'available',
    },
    external: AWSUtilitiesConfig,
    type: 'external',
  })
  public AWS?: AWSUtilitiesConfig;

  public CHUNK_SIZE?: number;
  public EMAIL_DEFAULT_FROM?: string;
  /**
   * Used with potentially recursive operations such as a save action triggering another save actions
   */
  public MAX_STASH_DEPTH: number;
  public email?: EmailConfig;

  // #endregion Object Properties
}

/**
 * Encryption key for x-jwt-token
 */
export const MAX_STASH_DEPTH = 'libs.utils.MAX_STASH_DEPTH';

export const EMAIL_CUSTOM_CONFIG = 'libs.utils.email.custom';
export const EMAIL_GMAIL_CONFIG = 'libs.utils.email.gmail';
export const EMAIL_MAILGUN_CONFIG = 'libs.utils.email.mailgun';
export const EMAIL_MANDRILL_CONFIG = 'utils.libs.email.mandrill';
export const EMAIL_SENDGRID_CONFIG = 'libs.utils.email.sendgrid';
export const EMAIL_SMTP_CONFIG = 'libs.utils.email.smtp';
export const EMAIL_DEFAULT_FROM = 'libs.utils.email.EMAIL_DEFAULT_FROM';
export const EMAIL_CHUNK_SIZE = 'libs.utils.email.CHUNK_SIZE';
export const UTILS_AWS = 'libs.utils.AWS';
