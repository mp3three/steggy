import { AutoLogService } from '@automagical/boilerplate';
import { AuthService, CalendarService } from '@automagical/google';
import {
  ApplicationManagerService,
  PromptService,
  Repl,
  ScreenService,
} from '@automagical/tty';
import { google } from 'googleapis';

@Repl({
  category: 'Google',
  name: 'Calendar',
})
export class DevCalendarService {
  constructor(
    private readonly promptService: PromptService,
    private readonly logger: AutoLogService,
    private readonly app: ApplicationManagerService,
    private readonly authService: AuthService,
    private readonly screenService: ScreenService,
    private readonly calendar: CalendarService,
  ) {}

  public async exec(): Promise<void> {
    await this.calendar.list();
    // // await this.authService.getAccessToken();
    // const token = await this.authService.client.getToken(
    //   '4/0AX4XfWi5gzdS360VQLhA-RgliTXaD-SzkcSoUvolWHD-RgZrdDDqBJtBXjNdNlmeF5nrWQ',
    // );
    // // this.client.setCredentials(token.tokens);
    // // this.client
    // this.screenService.print(JSON.stringify(token));
    await this.promptService.acknowledge();
  }
}
