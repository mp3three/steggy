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

  public CHUNK_SIZE?: number;
  public EMAIL_DEFAULT_FROM?: string;
  public custom?: EmailCustomConfig;
  public gmail?: EmailGmailConfig;
  public mailgun?: EmailMailgunConfig;
  public mandrill?: EmailMandrillConfig;
  public sendgrid?: EmailSendgridConfig;
  public smtp?: EmailSMTPConfig;

  // #endregion Object Properties
}

export const EMAIL_CUSTOM_CONFIG = 'libs.email.custom';
export const EMAIL_GMAIL_CONFIG = 'libs.email.gmail';
export const EMAIL_MAILGUN_CONFIG = 'libs.email.mailgun';
export const EMAIL_MANDRILL_CONFIG = 'libs.email.mandrill';
export const EMAIL_SENDGRID_CONFIG = 'libs.email.sendgrid';
export const EMAIL_SMTP_CONFIG = 'libs.email.smtp';
export const EMAIL_DEFAULT_FROM = 'libs.email.EMAIL_DEFAULT_FROM';
export const EMAIL_CHUNK_SIZE = 'libs.email.CHUNK_SIZE';
