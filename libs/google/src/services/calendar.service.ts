import { AutoLogService, InjectConfig } from '@steggy/boilerplate';
import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

import { AUTH_TOKEN } from '../config';
import { AuthService } from './auth.service';

@Injectable()
export class CalendarService {
  constructor(
    private readonly auth: AuthService,
    private readonly logger: AutoLogService,
    @InjectConfig(AUTH_TOKEN) private readonly authToken: string,
  ) {}

  private calendar: ReturnType<typeof google.calendar>;

  public async list(): Promise<void> {
    // const token = await this.auth.client.;
    // const result = await this.calendar.events.list({
    //   calendarId: 'cameron@form.io',
    // });
    // const result = await this.calendar.events.list({
    //   calendarId: 'primary',
    //   maxResults: 10,
    //   singleEvents: true,
    // });
    // result.data.items.forEach(i =>
    //   console.log(JSON.stringify(i, undefined, '  ')),
    // );
    // console.log(result);
  }

  protected onApplicationBootstrap(): void {
    this.calendar = google.calendar({
      auth: this.auth.client,
      version: 'v3',
    });
  }
}
