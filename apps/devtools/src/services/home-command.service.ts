import {
  RoomCommandDTO,
  RoomCommandScope,
  RoomControllerFlags,
  RoomControllerSettingsDTO,
} from '@automagical/controller-logic';
import { FanSpeeds } from '@automagical/home-assistant';
import { iRepl, PromptService, Repl } from '@automagical/tty';
import { AutoLogService, sleep, Trace } from '@automagical/utilities';
import { each } from 'async';
import inquirer from 'inquirer';

import { HomeFetchService } from './home-fetch.service';

type extra = { scope: RoomCommandScope[]; path?: string };

@Repl({
  name: '🏡 Home Command',
})
export class HomeCommandService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  @Trace()
  // @Timeout
  public async exec(): Promise<void> {
    const rooms = await this.pickRoom();
    if (!rooms) {
      this.logger.error(`Received empty room list`);
      await sleep(5000);
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
    if (this.mediaAvailable(rooms)) {
      actions.push({ key: 'm', name: 'Media', value: 'media' });
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

  private async getExtra(action: string): Promise<extra> {
    const out: extra = {
      scope: [RoomCommandScope.LOCAL, RoomCommandScope.ACCESSORIES],
    };
    switch (action) {
      case 'fan':
        const speed = await this.promptService.pickOne(
          'Fan speed',
          Object.keys(FanSpeeds)
            .reverse()
            .map((key) => {
              return {
                name:
                  key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
                value: key,
              };
            }),
        );
        out.path = `/${speed}`;
        return out;
      case 'media':
        const target = await this.promptService.pickOne('Action', [
          { name: 'Turn On', value: 'turnOn' },
          { name: 'Turn Off', value: 'turnOff' },
          { name: 'Play / Pause', value: 'playPause' },
          { name: 'Mute', value: 'mute' },
        ]);
        out.path = `/${target}`;
        return out;
    }
    return out;
  }

  private fanAvailable(rooms: RoomControllerSettingsDTO[]): boolean {
    return rooms.some((i) => typeof i.fan !== 'undefined');
  }

  private mediaAvailable(rooms: RoomControllerSettingsDTO[]): boolean {
    if (rooms.length !== 1) {
      return false;
    }
    return typeof rooms[0].media !== 'undefined';
  }

  private async pickRoom(): Promise<RoomControllerSettingsDTO[]> {
    const rooms = await this.fetchService.fetch<RoomControllerSettingsDTO[]>({
      url: `/room/list`,
    });
    if (rooms.length === 0) {
      return undefined;
    }
    const primary: Record<'name' | 'value', string>[] = [];
    const secondary: Record<'name' | 'value', string>[] = [];
    rooms.forEach((room) => {
      const entry = {
        name: room.friendlyName,
        value: room.name,
      };
      if (room.flags.includes(RoomControllerFlags.SECONDARY)) {
        secondary.push(entry);
        return;
      }
      primary.push(entry);
    });

    const selection = await this.promptService.pickOne('Which room(s)?', [
      ...this.sort(primary),
      new inquirer.Separator(),
      ...this.sort(secondary),
    ]);

    return rooms.filter((i) => selection === i.name);
  }

  private sort(
    items: Record<'name' | 'value', string>[],
  ): Record<'name' | 'value', string>[] {
    return items.sort((a, b) => {
      if (a.name > b.name) {
        return 1;
      }
      return -1;
    });
  }
}
