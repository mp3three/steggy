import { iRepl, PromptService, Repl, REPL_TYPE } from '@automagical/tty';
import { AutoLogService, Trace } from '@automagical/utilities';

import { HomeFetchService } from './home-fetch.service';

@Repl({
  description: [`Multi-room interactions`, `Misc commands`],
  name: '🏡 Home Command',
  type: REPL_TYPE.home,
})
export class HomeCommandService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  @Trace()
  public async exec(): Promise<void> {
    // c
  }
}
