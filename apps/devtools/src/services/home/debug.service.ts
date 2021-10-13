import { CANCEL, PromptService, Repl, REPL_TYPE } from '@automagical/tty';
import chalk from 'chalk';

import { HomeFetchService } from './home-fetch.service';

@Repl({
  name: `Debugger`,
  type: REPL_TYPE.home,
})
export class DebugService {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(defaultAction?: string): Promise<void> {
    const action = await this.promptService.menuSelect(
      this.promptService.itemsFromEntries([
        [chalk`{bold.magenta Light Manager}: Cache`, 'lightManagerCache'],
      ]),
      undefined,
      defaultAction,
    );

    switch (action) {
      case CANCEL:
        return;
      case 'lightManagerCache':
        await this.lightManagerCache();
        return await this.exec(action);
    }
  }

  private async lightManagerCache(): Promise<void> {
    const lights = await this.fetchService.fetch<string[]>({
      url: `/debug/active-lights`,
    });
    console.log(lights);
  }
}
