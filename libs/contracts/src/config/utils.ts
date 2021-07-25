import { APP_HOME_CONTROLLER, LIB_UTILS } from '../constants';
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
    applications: {
      [APP_HOME_CONTROLLER.description]: 'default',
    },
    type: 'number',
  })
  public LATITUDE?: number;
  @UsesConfig({
    applications: {
      [APP_HOME_CONTROLLER.description]: 'default',
    },
    type: 'number',
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
