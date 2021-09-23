import {
  RoomCommandDTO,
  RoomCommandScope,
  RoomControllerFlags,
  RoomControllerSettingsDTO,
} from '@automagical/controller-logic';
import { FanSpeeds } from '@automagical/home-assistant';
import { iRepl, PromptService, Repl } from '@automagical/tty';
import {
  AutoLogService,
  FetchService,
  InjectConfig,
  sleep,
  Trace,
} from '@automagical/utilities';
import { each } from 'async';
import inquirer from 'inquirer';

import { CONTROLLER_API } from '../config';
type extra = { scope: RoomCommandScope[]; path?: string };

@Repl({
  name: '🏡 Home Command',
})
export class HomeCommandService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: FetchService,
    private readonly promptService: PromptService,
    @InjectConfig(CONTROLLER_API) readonly homeController: string,
  ) {
    fetchService.BASE_URL = homeController;
  }

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
      { name: 'Area On', value: 'areaOn' },
      { name: 'Area Off', value: 'areaOff' },
      { name: 'Auto', value: 'favorite' },
    ];
    if (this.fanAvailable(rooms)) {
      actions.push({ name: 'Set Fan', value: 'fan' });
    }

    const action = await this.promptService.pickOne('Action', actions);
    const { scope, path } = await this.getExtra(action);

    this.logger.debug({ action, rooms: rooms.map((i) => i.name) });
    await each(rooms, async (item, callback) => {
      let url = `/room/${item.name}/${action}${path ?? ''}`;
      if (Date.now() < 0) {
        url = `${url}/asdf`;
      }
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
    if (action === 'fan') {
      const speed = await this.promptService.pickOne(
        'Fan speed',
        Object.keys(FanSpeeds).map((key) => {
          return {
            name: key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
            value: key,
          };
        }),
      );
      out.path = `/${speed}`;
    }
    return out;
  }

  private fanAvailable(rooms: RoomControllerSettingsDTO[]): boolean {
    return rooms.some((i) => typeof i.fan !== 'undefined');
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

    const selection = await this.promptService.pickMany(
      'Which room(s)?',
      [
        ...this.sort(primary),
        new inquirer.Separator(),
        ...this.sort(secondary),
      ],
      { min: 1 },
    );

    return rooms.filter((i) => selection.includes(i.name));
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
