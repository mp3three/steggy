import {
  RoomControllerSettingsDTO,
  RoomStateDTO,
} from '@automagical/controller-logic';
import { SwitchStateDTO } from '@automagical/home-assistant';
import {
  CANCEL,
  FontAwesomeIcons,
  iRepl,
  PromptService,
  Repl,
  REPL_TYPE,
} from '@automagical/tty';
import { AutoLogService } from '@automagical/utilities';
import inquirer, { Separator } from 'inquirer';

import { EntityService } from './entity.service';
import { GroupStateService } from './group-state.service';
import { HomeFetchService } from './home-fetch.service';

export type GroupItem = { entities: string[]; name: string; room: string };

@Repl({
  description: [`Manipulate established groups of entities`],
  name: `${FontAwesomeIcons.group} Groups`,
  type: REPL_TYPE.home,
})
export class GroupCommandService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    private readonly groupState: GroupStateService,
  ) {}

  public async exec(): Promise<void> {
    const action = await this.promptService.menuSelect<
      keyof GroupCommandService
    >([
      {
        name: 'List Groups',
        value: 'list',
      },
    ]);
    if (action === 'list') {
      await this.list();
    }
  }

  public async list(name?: string): Promise<void> {
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
  private async describeGroup(group: GroupItem): Promise<string> {
    const stateList = await this.fetchService.fetch<{
      states: SwitchStateDTO[];
    }>({
      url: `/group/${group.name}/describe`,
    });
    const entity = await this.promptService.menuSelect(
      stateList.states.map((item) => {
        if (!item) {
          return new Separator(`MISSING ENTITY`);
        }
        let name = `${item.attributes.friendly_name}`;
        if (item.state === 'on') {
          // TODO: Why is the green icon a different size?
          name = `🟢  ${name}`;
        }
        if (item.state === 'off') {
          name = `🔴 ${name}`;
        }
        return {
          name,
          value: item.entity_id,
        };
      }),
    );
    if (entity === CANCEL) {
      return entity;
    }
    await this.entityService.pickOne(entity);
    return await this.describeGroup(group);
  }

  private async process(group: GroupItem, list: GroupItem[]): Promise<void> {
    const action = await this.promptService.menuSelect([
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
        name: 'State Manager',
        value: 'state',
      },
      {
        name: 'Describe',
        value: 'describe',
      },
      {
        name: 'Send state',
        value: 'sendState',
      },
    ]);
    if (action === 'describe') {
      await this.describeGroup(group);
      return this.process(group, list);
    }

    switch (action) {
      // case
      case 'state':
        await this.groupState.processState(group, list);
        break;
      case 'done':
        return;
      // Describe
      // List all states
      case 'list':
        const stateList = await this.fetchService.fetch<RoomStateDTO[]>({
          url: `/group/${group.name}/list-states`,
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
          url: `/group/${group.name}/snapshot`,
        });
        console.log(state);
        break;
      // Done
      // Everything else
      default:
        await this.fetchService.fetch({
          method: 'put',
          url: `/group/${group.name}/command/${action}`,
        });
        break;
    }
    await this.process(group, list);
  }

  private async sendState(group: GroupItem, list: GroupItem[]): Promise<void> {
    const target = await this.promptService.pickOne(
      `Target group`,
      list.map((group) => ({ name: group.name, value: group })),
    );
    await this.fetchService.fetch({
      method: 'post',
      url: ``,
    });
  }
}
