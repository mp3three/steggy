import { QuickScript } from '@steggy/boilerplate';
import {
  ApplicationManagerService,
  PromptService,
  ScreenService,
  TTYModule,
} from '@steggy/tty';
import chalk from 'chalk';

/**
 * Testing chrono string parsing (as implemented in the date prompt at least) from the command line
 */
@QuickScript({ imports: [TTYModule] })
export class ChronoTesterService {
  constructor(
    private readonly promptService: PromptService,
    private readonly screenService: ScreenService,
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  public async exec(): Promise<void> {
    this.applicationManager.setHeader(`Chrono Tester`);
    this.screenService.down();
    await this.promptService.date({
      fuzzy: 'always',
      label: chalk.blue.bold`Enter string for parsing`,
    });
  }
}
