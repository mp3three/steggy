import { RoomControllerSettingsDTO } from '@automagical/controller-logic';
import { iRepl, PromptService, Repl } from '@automagical/tty';

import { HomeFetchService } from './home-fetch.service';

@Repl({
  name: '🎳 Group Command',
})
export class GroupCommandService implements iRepl {
  constructor(
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(): Promise<void> {
    const rooms = await this.fetchService.fetch<RoomControllerSettingsDTO[]>({
      url: `/room/list`,
    });
    const groups: { room: string; entities: string[]; name: string }[] = [];
    rooms.forEach((room) => {
      room.groups ??= {};
      Object.keys(room.groups).forEach((group) => {
        groups.push({
          entities: [],
          name: group,
          room: room.name,
        });
      });
    });

    const group = await this.promptService.pickOne(
      'Groups',
      groups.map((item) => {
        return {
          name: `${item.room} - ${item.name}`,
          value: item,
        };
      }),
    );

    const action = await this.promptService.expand('Action', [
      {
        key: 'o',
        name: 'Turn On',
        value: 'turnOn',
      },
      {
        key: 'f',
        name: 'Turn Off',
        value: 'turnOff',
      },
    ]);
  }
}
