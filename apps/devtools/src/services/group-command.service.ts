import { RoomControllerSettingsDTO } from '@automagical/controller-logic';
import { iRepl, PromptService, Repl } from '@automagical/tty';
import { sleep } from '@automagical/utilities';

import { HomeFetchService } from './home-fetch.service';

type GroupItem = { room: string; entities: string[]; name: string };

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
    const groups: GroupItem[] = [];
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
    await this.process(group);
  }

  private async process(group: GroupItem): Promise<void> {
    const action = await this.promptService.expand('Action', [
      {
        key: 'o',
        name: 'Turn On',
        value: 'turnOn',
      },
      {
        key: 'c',
        name: 'Turn On',
        value: 'turnOnCircadian',
      },
      {
        key: 'f',
        name: 'Turn Off',
        value: 'turnOff',
      },
      {
        key: 's',
        name: 'Current State',
        value: 'state',
      },
      {
        key: 'x',
        name: 'Done',
        value: 'done',
      },
    ]);

    switch (action) {
      case 'state':
        const data = await this.fetchService.fetch({
          url: `/room/${group.room}/group/${group.name}/describe`,
        });
        console.log(JSON.stringify(data, undefined, '  '));
        break;
      case 'done':
        return;
      default:
        await this.fetchService.fetch({
          method: 'put',
          url: `/room/${group.room}/group/${group.name}/command/${action}`,
        });
        break;
    }
    await this.process(group);
  }
}
