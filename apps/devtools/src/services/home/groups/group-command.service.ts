import {
  GROUP_TYPES,
  GroupDTO,
  GroupSaveStateDTO,
} from '@automagical/controller-logic';
import { HASS_DOMAINS } from '@automagical/home-assistant';
import {
  CANCEL,
  FontAwesomeIcons,
  iRepl,
  PromptMenuItems,
  PromptService,
  Repl,
  REPL_TYPE,
} from '@automagical/tty';
import { AutoLogService, IsEmpty, TitleCase } from '@automagical/utilities';
import chalk from 'chalk';
import inquirer, { Separator } from 'inquirer';

import { EntityService } from '../entity.service';
import { HomeFetchService } from '../home-fetch.service';
import { GroupStateService } from './group-state.service';
import { LightGroupCommandService } from './light-group-command.service';

export type GroupItem = { entities: string[]; name: string; room: string };

@Repl({
  description: [
    `Groups are collections of like entities that all act in a coordinated way.`,
    ``,
    ` - Light Group`,
    ` - Switch Group`,
    ` - Lock Group`,
    ` - Fan Group`
  ],
  icon: FontAwesomeIcons.group,
  name: `Groups`,
  type: REPL_TYPE.home,
})
export class GroupCommandService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    private readonly groupState: GroupStateService,
    private readonly lightGroup: LightGroupCommandService,
  ) {}

  public async create(): Promise<GroupDTO> {
    const type = await this.promptService.pickOne(
      `What type of group?`,
      Object.values(GROUP_TYPES).map((type) => ({
        name: TitleCase(type),
        value: type,
      })),
    );
    const friendlyName = await this.promptService.string(`Friendly Name`);
    const types = new Map([
      [GROUP_TYPES.light, [HASS_DOMAINS.light]],
      [
        GROUP_TYPES.switch,
        [
          HASS_DOMAINS.light,
          HASS_DOMAINS.fan,
          HASS_DOMAINS.media_player,
          HASS_DOMAINS.switch,
        ],
      ],
      [GROUP_TYPES.lock, [HASS_DOMAINS.lock]],
      [GROUP_TYPES.fan, [HASS_DOMAINS.fan]],
    ]);
    const entities = await this.entityService.buildList(types.get(type));
    const body: GroupDTO = {
      entities,
      friendlyName,
      type,
    };
    return await this.fetchService.fetch<GroupDTO>({
      body,
      method: 'post',
      url: `/group`,
    });
  }

  public async exec(): Promise<void> {
    const groups = await this.list();
    const action = await this.promptService.menuSelect<
      GroupDTO | keyof GroupCommandService
    >([
      ...(!IsEmpty(groups)
        ? [
            ...groups.map((group) => ({
              name: group.friendlyName,
              value: group,
            })),
            new inquirer.Separator(),
          ]
        : []),
      {
        name: 'Create Group',
        value: 'create',
      },
    ]);
    if (action === 'create') {
      await this.create();
      return await this.exec();
    }
    if (action === CANCEL) {
      return;
    }
    if (typeof action === 'string') {
      this.logger.error({ action }, `Command not implemented`);
      return;
    }
    await this.process(action, groups);
    return await this.exec();
  }

  public async getMap(): Promise<Map<string, GroupDTO>> {
    const groups = await this.list();
    return new Map(groups.map((i) => [i._id, i]));
  }

  public async list(): Promise<GroupDTO[]> {
    return await this.fetchService.fetch<GroupDTO[]>({
      url: `/group`,
    });
  }

  public async pickMany(
    inList: string[] = [],
    current: string[] = [],
  ): Promise<GroupDTO[]> {
    const groups = await this.list();
    return await this.promptService.pickMany(
      `Which groups?`,
      groups
        .filter((group) => IsEmpty(inList) || inList.includes(group._id))
        .map((group) => ({ name: group.friendlyName, value: group })),
      { default: current.filter((group) => current.includes(group)) },
    );
  }

  public async pickOne(omit: string[] = []): Promise<GroupDTO> {
    const groups = await this.list();
    return await this.promptService.pickOne(
      `Pick a group`,
      groups
        .filter((group) => !omit.includes(group._id))
        .map((group) => ({ name: group.friendlyName, value: group })),
    );
  }

  public async process(
    group: GroupDTO,
    list: GroupDTO[],
    defaultValue?: string,
  ): Promise<void> {
    this.promptService.header(group.friendlyName);
    const actions: PromptMenuItems = [];
    if (group.type === GROUP_TYPES.light) {
      actions.push(...(await this.lightGroup.groupActions()));
    }
    const action = await this.promptService.menuSelect(
      [
        ...actions,
        ...this.promptService.itemsFromEntries([
          ['Delete', 'delete'],
          ['Describe', 'describe'],
          ['Rename', 'rename'],
          ['Send state', 'sendState'],
          ['State Manager', 'state'],
        ]),
      ],
      `Action`,
      defaultValue,
    );
    if (action === 'describe') {
      await this.describeGroup(group);
      return this.process(group, list, action);
    }
    switch (action) {
      case 'state':
        await this.groupState.processState(group, list);
        break;
      case CANCEL:
        return;
      // Capture state
      case 'capture':
        const state = await this.fetchService.fetch({
          body: {
            name: await this.promptService.string(`Name for save state`),
          },
          method: 'post',
          url: `/group/${group._id}/capture`,
        });
        console.log(state);
        break;
      case 'rename':
        group.friendlyName = await this.promptService.string(
          `New name`,
          group.friendlyName,
        );
        group = await this.fetchService.fetch({
          body: group,
          method: 'put',
          url: `/group/${group._id}`,
        });
        break;
      case 'delete':
        await this.fetchService.fetch({
          method: 'delete',
          url: `/group/${group._id}`,
        });
        return;
      default:
        if (group.type === GROUP_TYPES.light) {
          await this.lightGroup.processAction(group, action);
          break;
        }
        this.logger.error({ action, type: group.type }, `Bad action`);
    }
    await this.process(group, list, action);
  }

  public async roomSaveAction(
    group: GroupDTO,
    defaultValue?: RoomGroupSaveStateDTO,
  ): Promise<RoomGroupSaveStateDTO> {
    console.log(chalk`{magenta ${group.friendlyName}} state action`);
    group.save_states ??= [];
    let defaultAction: GroupSaveStateDTO | string;
    if (defaultValue) {
      defaultAction = group.save_states.find(
        ({ id }) => id === defaultValue.action,
      );
    }
    const action = await this.promptService.pickOne<GroupSaveStateDTO | string>(
      `What should this group do?`,
      [
        new inquirer.Separator(`Activate general command`),
        ...this.groupActions(group.type).map((i) => ({ name: i, value: i })),
        new inquirer.Separator(`Load save state`),
        ...group.save_states.map((save) => ({ name: save.name, value: save })),
      ],
      defaultAction,
    );
    if (typeof action === 'string') {
      if (
        group.type === GROUP_TYPES.light &&
        ['turnOn', 'circadianLight'].includes(action)
      ) {
        let brightness: number;
        if (await this.promptService.confirm(`Set brightness`)) {
          brightness = await this.promptService.number(
            `Brightness value (1-255)`,
            defaultValue?.extra?.brightness as number,
          );
        }
        return {
          action,
          extra: {
            brightness,
          },
          group: group._id,
        };
      }
      return {
        action,
        group: group._id,
      };
    }
    return {
      action: action.id,
      group: group._id,
    };
  }

  private async describeGroup(group: GroupDTO): Promise<string> {
    group.state ??= [];
    group = await this.fetchService.fetch({
      url: `/group/${group._id}`,
    });
    const entity = await this.promptService.menuSelect(
      group.state.map((item, index) => {
        const value = group.entities[index];
        if (!value) {
          return new Separator(`MISSING ENTITY`);
        }
        let name = `${value}`;
        if (item.state === 'on') {
          name = chalk.green(name);
        }
        if (item.state === 'off') {
          name = chalk.red(name);
        }
        return {
          name,
          value,
        };
      }),
    );
    if (entity === CANCEL) {
      return entity;
    }
    await this.entityService.process(entity);
    return await this.describeGroup(group);
  }

  private groupActions(type: GROUP_TYPES): string[] {
    switch (type) {
      case GROUP_TYPES.light:
        return ['turnOn', 'turnOff', 'circadianLight'];
      case GROUP_TYPES.switch:
      case GROUP_TYPES.fan:
        return ['turnOn', 'turnOff'];
      case GROUP_TYPES.lock:
        return ['lock', 'unlock'];
    }
    this.logger.error({ type }, `Not implemented group type`);
    return [];
  }
}
