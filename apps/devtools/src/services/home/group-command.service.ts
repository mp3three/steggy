import {
  DuplicateStateDTO,
  RoomControllerSettingsDTO,
  RoomStateDTO,
} from '@automagical/controller-logic';
import { iRepl, PromptService, Repl, REPL_TYPE } from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import { encode } from 'ini';
import inquirer from 'inquirer';

import { HomeFetchService } from './home-fetch.service';

type GroupItem = { entities: string[]; name: string; room: string };
const EMPTY = 0;

@Repl({
  description: [`Manipulate established groups of entities`],
  name: '🎳 Groups',
  type: REPL_TYPE.home,
})
export class GroupCommandService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
  ) {}

  public async exec(name?: string): Promise<void> {
    const rooms = await this.fetchService.fetch<RoomControllerSettingsDTO[]>({
      url: `/room/list`,
    });
    const groups: GroupItem[] = [];
    rooms
      .filter((room) => {
        if (!name) {
          return true;
        }
        return room.name === name;
      })
      .forEach((room) => {
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
      groups.map((value) => ({
        name: value.name,
        value,
      })),
    );
    await this.process(group, groups);
  }

  private async copyState(
    from: RoomStateDTO,
    list: GroupItem[],
  ): Promise<void> {
    const targetGroup = await this.promptService.pickOne(
      `Target group`,
      list.map((value) => ({
        name: value.name,
        value,
      })),
    );
    const name = await this.promptService.string(`Save as`, from.name);
    await this.fetchService.fetch({
      body: {
        entities: targetGroup.entities,
        group: targetGroup.name,
        name,
        room: targetGroup.room,
      } as DuplicateStateDTO,
      method: 'post',
      url: `/state/${from._id}/copy`,
    });
  }

  private async pickAction(): Promise<string> {
    let action = await this.promptService.pickOne('Action', [
      {
        name: 'Direct Change',
        value: 'direct',
      },
      {
        name: 'State Manager',
        value: 'state',
      },
      new inquirer.Separator(),
      {
        name: 'Done',
        value: 'done',
      },
    ]);
    if (action === 'direct') {
      action = await this.promptService.pickOne('Specific', [
        {
          name: 'Turn On',
          value: 'turnOn',
        },
        {
          name: 'Turn Off',
          value: 'turnOff',
        },
        {
          name: 'Circadian On',
          value: 'turnOnCircadian',
        },
        new inquirer.Separator(),
        {
          name: 'Cancel',
          value: 'done',
        },
      ]);
      if (action === 'done') {
        return await this.pickAction();
      }
    }
    return action;
  }

  private async process(group: GroupItem, list: GroupItem[]): Promise<void> {
    const action = await this.pickAction();

    switch (action) {
      case 'state':
        await this.processState(group, list);
        break;
      case 'done':
        return;
      // Describe
      // List all states
      case 'list':
        const stateList = await this.fetchService.fetch<RoomStateDTO[]>({
          url: `/room/${group.room}/group/${group.name}/list-states`,
        });
        console.log(JSON.stringify(stateList, undefined, '  '));
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
      // Everything else
      default:
        await this.fetchService.fetch({
          method: 'put',
          url: `/room/${group.room}/group/${group.name}/command/${action}`,
        });
        break;
    }
    await this.process(group, list);
  }

  private async processState(
    group: GroupItem,
    list: GroupItem[],
  ): Promise<void> {
    const action = await this.promptService.pickOne('Specific', [
      {
        name: 'List Available',
        value: 'list',
      },
      {
        name: 'Describe current',
        value: 'describe',
      },
      {
        name: 'Capture Current',
        value: 'capture',
      },
      {
        name: 'Cancel',
        value: 'cancel',
      },
    ]);
    if (action === 'cancel') {
      return;
    }
    if (action === 'capture') {
      await this.fetchService.fetch({
        body: {
          name: await this.promptService.string(`Name for save state`),
        },
        method: 'post',
        url: `/room/${group.room}/group/${group.name}/snapshot`,
      });
      return;
    }
    if (action === 'describe') {
      const describe = await this.fetchService.fetch<RoomStateDTO[]>({
        url: `/room/${group.room}/group/${group.name}/describe`,
      });
      console.log(JSON.stringify(describe, undefined, '  '));
      return;
    }

    const data = await this.fetchService.fetch<RoomStateDTO[]>({
      url: `/room/${group.room}/group/${group.name}/list-states`,
    });

    if (data.length === EMPTY) {
      this.logger.warn(`No states currently associated with group`);
      return;
    }

    const state = await this.promptService.pickOne(
      'Pick state',
      data.map((item) => {
        return {
          name: item.name,
          value: item,
        };
      }),
    );

    await this.stateAction(state, list);
  }

  private async stateAction(
    state: RoomStateDTO,
    list: GroupItem[],
  ): Promise<void> {
    const stateAction = await this.promptService.pickOne('What to do?', [
      {
        name: 'Activate',
        value: 'activate',
      },
      {
        name: 'Describe',
        value: 'describe',
      },
      new inquirer.Separator(),
      {
        name: 'Copy to another group',
        value: 'copy',
      },
      {
        name: 'Delete',
        value: 'delete',
      },
      new inquirer.Separator(),
      {
        name: 'Done',
        value: 'done',
      },
    ]);

    switch (stateAction) {
      case 'done':
        this.logger.info(`Groups > ${state.group}`);
        return;
      case 'copy':
        await this.copyState(state, list);
        return;
      case 'activate':
        await this.fetchService.fetch({
          method: 'put',
          url: `/state/${state._id}/activate`,
        });
        return;
      case 'describe':
        console.log(encode(state));
        // console.log(JSON.stringify(state, undefined, '  '));
        return await this.stateAction(state, list);
      case 'delete':
        await this.fetchService.fetch({
          method: 'delete',
          url: `/state/${state._id}`,
        });
        return;
    }
  }
}
