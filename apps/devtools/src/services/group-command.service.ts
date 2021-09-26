import {
  RoomControllerSettingsDTO,
  RoomStateDTO,
} from '@automagical/controller-logic';
import { iRepl, PromptService, Repl } from '@automagical/tty';

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
        name: 'Circadian On',
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
        key: 't',
        name: 'Capture Current State',
        value: 'capture',
      },
      {
        key: 'l',
        name: 'List States',
        value: 'list',
      },
      {
        key: 'x',
        name: 'Done',
        value: 'done',
      },
    ]);

    switch (action) {
      // Describe
      case 'state':
        const data = await this.fetchService.fetch({
          url: `/room/${group.room}/group/${group.name}/describe`,
        });
        console.log(JSON.stringify(data, undefined, '  '));
        break;
      // List all states
      case 'list':
        const stateList = await this.fetchService.fetch<RoomStateDTO[]>({
          url: `/room/${group.room}/group/${group.name}/list-states`,
        });
        console.log(stateList);
        break;
      // Capture state
      case 'capture':
        const state = await this.fetchService.fetch({
          body: {
            name: await this.promptService.string(`Name for save state`),
          },
          method: 'post',
          url: `/room/${group.room}/group/${group.name}/snapshot`,
        });
        console.log(state);
        break;
      // Done
      case 'done':
        return;
      // Everything else
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
