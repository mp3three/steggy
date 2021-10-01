import {
  RoomCommandDTO,
  RoomCommandScope,
  RoomControllerSettingsDTO,
} from '@automagical/controller-logic';
import { FanSpeeds } from '@automagical/home-assistant';
import { iRepl, PromptService, Repl, REPL_TYPE } from '@automagical/tty';
import { AutoLogService, TitleCase, Trace } from '@automagical/utilities';
import { each } from 'async';
import inquirer from 'inquirer';

import { HomeFetchService } from './home-fetch.service';

type extra = { path?: string; scope: RoomCommandScope[] };

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
