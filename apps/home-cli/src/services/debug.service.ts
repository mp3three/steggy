import { DONE, PromptService, Repl } from '@automagical/tty';
import chalk from 'chalk';

import { ICONS } from '../typings';
import { HomeFetchService } from './home-fetch.service';

@Repl({
  category: `Misc`,
  icon: ICONS.DEBUG,
  name: `Debugger`,
})
export class DebugService {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(defaultAction?: string): Promise<void> {
    const action = await this.promptService.menuSelect(
      [[chalk`{bold.magenta Light Manager}: Cache`, 'lightManagerCache']],
      undefined,
      defaultAction,
    );

    switch (action) {
      case DONE:
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
