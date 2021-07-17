import { EmailActionSettingsDTO } from '@automagical/contracts/action';
import {
  EMAIL_CHUNK_SIZE,
  EMAIL_GMAIL_CONFIG,
  EMAIL_MAILGUN_CONFIG,
  EMAIL_MANDRILL_CONFIG,
  EMAIL_SENDGRID_CONFIG,
  EMAIL_SMTP_CONFIG,
  EmailConfig,
  EmailGmailConfig,
  EmailMandrillConfig,
  EmailSendgridConfig,
  EmailSMTPConfig,
} from '@automagical/contracts/config';
import { LIB_UTILS } from '@automagical/contracts/constants';
import type {
  NunjucksOptions,
  NunjucksParametersDTO,
  NunjucksRenderDTO,
} from '@automagical/contracts/email';
import { ProjectDTO, SubmissionDTO } from '@automagical/contracts/formio-sdk';
import { APIRequest } from '@automagical/contracts/server';
import { Thread } from '@automagical/wrapper';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
  Scope,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eachLimit } from 'async';
import { PinoLogger } from 'nestjs-pino';
import { createTransport, Transporter } from 'nodemailer';
import mailgun from 'nodemailer-mailgun-transport';
import mandrill from 'nodemailer-mandrill-transport';
import sendgrid from 'nodemailer-sendgrid-transport';

import { InjectLogger, Trace } from '../decorators';

@Injectable({ scope: Scope.REQUEST })
export class EmailerService {
  // #region Constructors

  constructor(
    @InjectLogger(EmailerService, LIB_UTILS)
    private readonly logger: PinoLogger,
    private readonly configService: ConfigService,
    @Inject(APIRequest) private readonly request: APIRequest<SubmissionDTO>,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public listTransports(
    project: ProjectDTO,
  ): Record<'transport' | 'title', string>[] {
    const availableTransports = [];
    const config = this.configService.get<EmailConfig>('libs.email');
    if (config.custom || project.settings.email.custom) {
      availableTransports.push({
        title: 'Custom',
        transport: 'custom',
      });
    }
    if (config.gmail || project.settings.email.gmail) {
      availableTransports.push({
        title: 'G-Mail',
        transport: 'gmail',
      });
    }
    if (config.sendgrid || project.settings.email.sendgrid) {
      availableTransports.push({
        title: 'SendGrid',
        transport: 'sendgrid',
      });
    }
    if (config.mandrill || project.settings.email.mandrill) {
      availableTransports.push({
        title: 'Mandrill',
        transport: 'mandrill',
      });
    }
    if (config.mailgun || project.settings.email.mailgun) {
      availableTransports.push({
        title: 'Mailgun',
        transport: 'mailgun',
      });
    }
    if (config.smtp || project.settings.email.smtp) {
      availableTransports.push({
        title: 'SMTP',
        transport: 'smtp',
      });
    }
    return availableTransports;
  }

  @Trace()
  public async send(settings: EmailActionSettingsDTO): Promise<void> {
    const { project, user, form } = this.request.res.locals;
    const transport = await this.getTransport(settings);
    const parameters: NunjucksOptions = {
      ...this.request.body,
      form,
      req: {
        body: this.request.body,
        params: this.request.params as Record<string, string>,
        query: this.request.query as Record<string, string>,
        user,
      },
      settings,
    };
    const mail = await this.nunjucks({
      context: parameters,
      options: {
        params: parameters,
      },
      render: {
        bcc: settings.bcc.join(', '),
        cc: settings.cc.join(', '),
        from: settings.from || project.settings.email.EMAIL_DEFAULT_FROM,
        html: settings.message,
        messageTransport: settings.transport as string,
        subject: settings.subject,
        to: settings.emails.join(', '),
        transport: settings.transport as string,
      },
    });

    const to = mail.to.split(',').map((item) => item.trim());

    await this.validateEmail(mail.from);

    await eachLimit(
      settings.sendEach ? to : [to.join(', ')],
      this.configService.get(EMAIL_CHUNK_SIZE),
      async (to) => {
        try {
          await transport.sendMail({
            ...mail,
            to,
          });
        } catch (error) {
          this.logger.error({ error }, 'sendMail error');
        }
      },
    );
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected async getTransport(
    settings: EmailActionSettingsDTO,
  ): Promise<Transporter> {
    switch (settings.transport) {
      case 'custom':
        throw new NotImplementedException();
      case 'gmail':
        return await this.gmailTransport();
      case 'mailgun':
        return await this.mailgunTransport();
      case 'mandrill':
        return await this.mandrillTransport();
      case 'sendgrid':
        return await this.sendgridTransport();
      case 'smtp':
        return await this.smtpTransport();
      case 'default':
        throw new NotImplementedException();
    }
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private async gmailTransport(): Promise<Transporter> {
    const { project } = this.request.res.locals;
    const config =
      project.settings?.email?.gmail ??
      this.configService.get<EmailGmailConfig>(EMAIL_GMAIL_CONFIG);
    return createTransport({
      service: 'Gmail',
      ...config,
    });
  }

  /**
   * For some reason, un-commenting the return line completely breaks the server
   */
  @Trace()
  private async mailgunTransport(): Promise<Transporter> {
    const { project } = this.request.res.locals;
    const config =
      project.settings?.email?.mailgun ??
      this.configService.get<EmailSendgridConfig>(EMAIL_MAILGUN_CONFIG);
    return createTransport(mailgun(config));
  }

  @Trace()
  private async mandrillTransport(): Promise<Transporter> {
    const { project } = this.request.res.locals;
    const config =
      project.settings?.email?.mandrill ??
      this.configService.get<EmailMandrillConfig>(EMAIL_MANDRILL_CONFIG);
    return createTransport(mandrill(config));
  }

  @Trace()
  private async nunjucks(
    parameters: NunjucksParametersDTO,
  ): Promise<NunjucksRenderDTO> {
    const thread = new Thread('nunjucks');
    return await thread.start(parameters);
  }

  @Trace()
  private async sendgridTransport(
    config?: EmailSendgridConfig,
  ): Promise<Transporter> {
    const { project } = this.request.res.locals;
    config ??=
      project.settings?.email?.sendgrid ??
      this.configService.get<EmailSendgridConfig>(EMAIL_SENDGRID_CONFIG);
    return createTransport(sendgrid(config));
  }

  @Trace()
  private async smtpTransport(): Promise<Transporter> {
    const { project } = this.request.res.locals;
    const config =
      project.settings?.email?.smtp ??
      this.configService.get<EmailSMTPConfig>(EMAIL_SMTP_CONFIG);
    if (typeof config.secure === 'string') {
      config.secure = config.secure.toLowerCase() === 'true';
    }
    if (typeof config.ignoreTLS === 'string') {
      config.ignoreTLS = config.ignoreTLS.toLowerCase() === 'true';
    }
    if (typeof config.allowUnauthorizedCerts === 'string') {
      config.allowUnauthorizedCerts =
        config.allowUnauthorizedCerts.toLowerCase() === 'true';
    }
    return createTransport(
      sendgrid({
        auth: config.auth,
        debug: true,
        host: config.host,
        ignoreTLS: config.ignoreTLS,
        port: Number(config.port),
        secure: config.secure,
        tls: config.allowUnauthorizedCerts
          ? { rejectUnauthorized: false }
          : undefined,
      }),
    );
  }

  @Trace()
  private async validateEmail(from: string): Promise<void> {
    if (!from.includes('form.io')) {
      return;
    }
    throw new InternalServerErrorException(
      `Disallowed email from address: ${from}`,
    );
  }

  // #endregion Private Methods
}
