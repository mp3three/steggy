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
    const { primary, secondary } = await this.fetchService.listRooms();

    const rooms = await this.promptService.pickMany(
      'Which room(s)?',
      [...primary, new inquirer.Separator(), ...secondary],
      { min: 1 },
    );
    if (!rooms) {
      this.logger.error(`Received empty room list`);
      // Acknowledge the message, since the next step clears the screen
      await this.promptService.confirm('');
      return;
    }
    const actions = [
      { key: 'o', name: 'Area On', value: 'areaOn' },
      { key: 'x', name: 'Area Off', value: 'areaOff' },
      { key: 'a', name: 'Auto', value: 'favorite' },
    ];
    if (this.fanAvailable(rooms)) {
      actions.push({ key: 'f', name: 'Set Fan', value: 'fan' });
    }

    const action = await this.promptService.expand('Action', actions);
    const { scope, path } = await this.getExtra(action);

    this.logger.debug({ action, rooms: rooms.map((i) => i.name) });
    await each(rooms, async (item, callback) => {
      const url = `/room/${item.name}/${action}${path ?? ''}`;
      this.logger.debug(`PUT ${url}`);
      const response = await this.fetchService.fetch({
        body: JSON.stringify({
          scope,
        } as RoomCommandDTO),
        method: 'put',
        url,
      });
      this.logger.debug({ response });
      callback();
    });
  }

  private fanAvailable(rooms: RoomControllerSettingsDTO[]): boolean {
    return rooms.some((i) => typeof i.fan !== 'undefined');
  }

  private async getExtra(action: string): Promise<extra> {
    const out: extra = {
      scope: [RoomCommandScope.LOCAL, RoomCommandScope.ACCESSORIES],
    };
    if (action === 'fan') {
      // switch (action) {
      // case 'fan':
      const speed = await this.promptService.pickOne(
        'Fan speed',
        Object.keys(FanSpeeds)
          .reverse()
          .map((key) => {
            return {
              name: TitleCase(key),
              value: key,
            };
          }),
      );
      out.path = `/${speed}`;
      return out;
      // }
    }
    return out;
  }
}
