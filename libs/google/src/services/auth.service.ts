import {
  AutoLogService,
  InjectConfig,
  WorkspaceService,
} from '@automagical/boilerplate';
import {
  ApplicationManagerService,
  PromptService,
  ScreenService,
} from '@automagical/tty';
import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';

import { API_KEY, CLIENT_ID, CLIENT_SECRET, REDIRECT_URL } from '../config';

@Injectable()
export class AuthService {
  constructor(
    private readonly logger: AutoLogService,

    @InjectConfig(API_KEY) private readonly apiKey: string,
    @InjectConfig(CLIENT_SECRET) private readonly clientSecret: string,
    @InjectConfig(CLIENT_ID) private readonly clientId: string,
    @InjectConfig(REDIRECT_URL) private readonly redirectUrl: string,
    private readonly promptService: PromptService,
    private readonly screenService: ScreenService,
    private readonly application: ApplicationManagerService,
    private readonly workspaceService: WorkspaceService,
  ) {}

  public client: OAuth2Client;

  protected onModuleInit(): void {
    this.client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret,
      this.redirectUrl,
    );
    this.client.setCredentials({});
  }

  public async getAccessToken(): Promise<void> {
    const authUrl = this.client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.readonly'],
    });
    this.screenService.print(authUrl);
    const code = await this.promptService.string(`Enter code from url`);
    const token = await this.client.getToken(code);
    // this.client.setCredentials(token.tokens);
    // this.client
    this.screenService.print(JSON.stringify(token));
    await this.promptService.acknowledge();
  }
}
