export class EmailCustomConfig {
  public url: string;

  
}

export class EmailGmailConfig {
  public auth: Record<'user' | 'pass', string>;

  
}

export class EmailSendgridConfig {
  public auth: Record<'api_user' | 'api_key', string>;

  
}

export class EmailMandrillConfig {
  public auth: Record<'apiKey', string>;

  
}

export class EmailMailgunConfig {
  public auth: Record<'api_key', string>;

  
}

export class EmailSMTPConfig {
  public allowUnauthorizedCerts?: boolean | string;
  public auth?: Record<'user' | 'pass', string>;
  public host: string;
  public ignoreTLS?: boolean | string;
  public port?: number;
  public secure?: boolean | string;

  
}

export class EmailConfig {
  public CHUNK_SIZE?: number;
  public EMAIL_DEFAULT_FROM?: string;
  public custom?: EmailCustomConfig;
  public gmail?: EmailGmailConfig;
  public mailgun?: EmailMailgunConfig;
  public mandrill?: EmailMandrillConfig;
  public sendgrid?: EmailSendgridConfig;
  public smtp?: EmailSMTPConfig;

  
}

export const EMAIL_CUSTOM_CONFIG = 'libs.email.custom';
export const EMAIL_GMAIL_CONFIG = 'libs.email.gmail';
export const EMAIL_MAILGUN_CONFIG = 'libs.email.mailgun';
export const EMAIL_MANDRILL_CONFIG = 'libs.email.mandrill';
export const EMAIL_SENDGRID_CONFIG = 'libs.email.sendgrid';
export const EMAIL_SMTP_CONFIG = 'libs.email.smtp';
export const EMAIL_DEFAULT_FROM = 'libs.email.EMAIL_DEFAULT_FROM';
export const EMAIL_CHUNK_SIZE = 'libs.email.CHUNK_SIZE';
