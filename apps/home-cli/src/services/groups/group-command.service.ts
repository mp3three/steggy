import { GroupDTO, GROUP_TYPES } from '@automagical/controller-logic';
import { HASS_DOMAINS } from '@automagical/home-assistant';
import {
  DONE,
  FontAwesomeIcons,
  iRepl,
  PromptEntry,
  PromptService,
  Repl,
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
    ` - Fan Group`,
  ],
  icon: FontAwesomeIcons.group,
  name: `Groups`,
  category: `Control`,
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
      Object.values(GROUP_TYPES).map((type) => [TitleCase(type), type]),
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
    const action = await this.promptService.menuSelect<GroupDTO>([
      ...this.promptService.conditionalEntries(!IsEmpty(groups), [
        ...groups.map((group) => [group.friendlyName, group]),
        new inquirer.Separator(),
      ] as PromptEntry<GroupDTO>[]),
      ['Create Group', 'create'],
    ]);
    if (action === 'create') {
      await this.create();
      return await this.exec();
    }
    if (action === DONE) {
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

  public async get(group: GroupDTO | string): Promise<GroupDTO> {
    return await this.fetchService.fetch({
      url: `/group/${typeof group === 'string' ? group : group._id}`,
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
        .map((group) => [group.friendlyName, group]),
      { default: current.filter((group) => current.includes(group)) },
    );
  }

  public async pickOne(omit: string[] = []): Promise<GroupDTO> {
    const groups = await this.list();
    return await this.promptService.pickOne(
      `Pick a group`,
      groups
        .filter((group) => !omit.includes(group._id))
        .map((group) => [group.friendlyName, group]),
    );
  }

  public async process(
    group: GroupDTO,
    list: GroupDTO[],
    defaultValue?: string,
  ): Promise<void> {
    this.promptService.header(group.friendlyName);
    const actions: PromptEntry[] = [];
    if (group.type === GROUP_TYPES.light) {
      actions.push(...(await this.lightGroup.groupActions()));
    }
    const action = await this.promptService.menuSelect(
      [
        ...actions,
        ['Delete', 'delete'],
        ['Describe', 'describe'],
        ['Rename', 'rename'],
        ['Send state', 'sendState'],
        ['State Manager', 'state'],
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
      case DONE:
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

  private async describeGroup(group: GroupDTO): Promise<string> {
    group.state.states ??= [];
    group = await this.fetchService.fetch({
      url: `/group/${group._id}`,
    });
    const entity = await this.promptService.menuSelect(
      group.state.states.map((item, index) => {
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
        return [name, value];
      }),
    );
    if (entity === DONE) {
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
