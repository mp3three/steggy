import {
  GROUP_TYPES,
  GroupDTO,
  GroupSaveStateDTO,
  RoomEntitySaveStateDTO,
} from '@ccontour/controller-logic';
import { HASS_DOMAINS } from '@ccontour/home-assistant';
import {
  DONE,
  ICONS,
  iRepl,
  PinnedItemService,
  PromptEntry,
  PromptService,
  Repl,
  ToMenuEntry,
} from '@ccontour/tty';
import {
  ARRAY_OFFSET,
  AutoLogService,
  DOWN,
  IsEmpty,
  ResultControlDTO,
  TitleCase,
  UP,
} from '@ccontour/utilities';
import {
  forwardRef,
  Inject,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { EntityService } from '../home-assistant/entity.service';
import { HomeFetchService } from '../home-fetch.service';
import { FanGroupCommandService } from './fan-group-command.service';
import { GroupStateService } from './group-state.service';
import { LightGroupCommandService } from './light-group-command.service';
import { LockGroupCommandService } from './lock-group-command.service';
import { SwitchGroupCommandService } from './switch-group-command.service';

export type GroupItem = { entities: string[]; name: string; room: string };
const LIGHT_COMMAND_SEPARATOR = new inquirer.Separator(
  chalk.white('Light commands'),
);
const GROUP_DOMAINS = new Map([
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

@Repl({
  category: `Control`,
  icon: ICONS.GROUPS,
  keybind: 'g',
  name: `Groups`,
})
export class GroupCommandService implements iRepl {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    @Inject(forwardRef(() => GroupStateService))
    private readonly groupState: GroupStateService,
    private readonly lightGroup: LightGroupCommandService,
    private readonly fanGroup: FanGroupCommandService,
    private readonly lockGroup: LockGroupCommandService,
    private readonly pinnedItems: PinnedItemService,
    private readonly switchGroup: SwitchGroupCommandService,
  ) {}

  private lastGroup: string;

  public async create(): Promise<GroupDTO> {
    const type = await this.promptService.pickOne(
      `What type of group?`,
      Object.values(GROUP_TYPES).map((type) => [TitleCase(type, false), type]),
    );
    const friendlyName = await this.promptService.friendlyName();
    const entities = await this.entityService.buildList(
      GROUP_DOMAINS.get(type),
    );
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

  public async createSaveCommand(
    group: GroupDTO,
    current: Partial<RoomEntitySaveStateDTO> = {},
  ): Promise<RoomEntitySaveStateDTO> {
    let state = await this.promptService.pickOne<GroupSaveStateDTO | string>(
      `${chalk.magenta.bold(group.friendlyName)} save state`,
      [
        [`${ICONS.CREATE}Create new state`, `create`],
        ...this.promptService.conditionalEntries(!IsEmpty(group.save_states), [
          new inquirer.Separator(chalk.white`Existing states`),
          ...(group.save_states.map((i) => [
            i.friendlyName,
            i,
          ]) as PromptEntry<GroupSaveStateDTO>[]),
        ]),
      ],
      group.save_states.find(({ id }) => id === current.state),
    );
    if (state === 'create') {
      group = await this.groupState.build(group);
      state = group.save_states[group.save_states.length - ARRAY_OFFSET];
      if (!state) {
        throw new InternalServerErrorException(`wat`);
      }
    }
    if (typeof state === 'string') {
      throw new NotImplementedException();
    }
    return {
      ref: group._id,
      state: state.id,
      type: 'group',
    };
  }

  public async exec(): Promise<void> {
    const groups = await this.list();
    const action = await this.promptService.menu<GroupDTO>({
      right: ToMenuEntry([
        ...this.promptService.conditionalEntries(
          !IsEmpty(groups),
          this.groupEntries(groups),
        ),
        new inquirer.Separator(chalk.white`Actions`),
        [`${ICONS.CREATE}Create Group`, 'create'],
      ]),
      rightHeader: 'Pick group',
      value: this.lastGroup
        ? groups.find(({ _id }) => _id === this.lastGroup)
        : undefined,
    });
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
    this.lastGroup = action._id;
    await this.process(action, groups);
  }

  public async get(group: GroupDTO | string): Promise<GroupDTO> {
    return await this.fetchService.fetch({
      url: `/group/${typeof group === 'string' ? group : group._id}`,
    });
  }

  public async getMap(): Promise<Map<string, GroupDTO>> {
    const groups = await this.list();
    return new Map(groups.map((i) => [i._id, i]));
  }

  public async list(
    control: ResultControlDTO = {
      sort: [`friendlyName`],
    },
  ): Promise<GroupDTO[]> {
    return await this.fetchService.fetch<GroupDTO[]>({
      control,
      url: `/group`,
    });
  }
  public async pickMany(
    inList: string[] = [],
    current: string[] = [],
  ): Promise<GroupDTO[]> {
    const groups = await this.list();
    return await this.promptService.pickMany(
      `Update list of groups`,
      groups
        .filter((group) => IsEmpty(inList) || inList.includes(group._id))
        .map((group) => [group.friendlyName, group]),
      { default: groups.filter(({ _id }) => current.includes(_id)) },
    );
  }

  public async pickOne(
    inList: string[] = [],
    defaultValue?: GroupDTO | string,
  ): Promise<GroupDTO> {
    const groups = await this.list();
    inList = IsEmpty(inList) ? groups.map(({ _id }) => _id) : inList;
    if (defaultValue) {
      defaultValue = groups.find(
        ({ _id }) =>
          _id ===
          (typeof defaultValue === 'string' ? defaultValue : defaultValue._id),
      );
    }
    return await this.promptService.pickOne(
      `Pick a group`,
      groups
        .filter((group) => inList.includes(group._id))
        .map((group) => [group.friendlyName, group]),
      defaultValue,
    );
  }

  public async process(
    group: GroupDTO,
    list: GroupDTO[],
    defaultValue?: string,
  ): Promise<void> {
    await this.header(group);
    const actions: PromptEntry[] = [];
    switch (group.type) {
      case GROUP_TYPES.light:
        actions.push(
          LIGHT_COMMAND_SEPARATOR,
          ...(await this.lightGroup.groupActions()),
        );
        break;
      case GROUP_TYPES.switch:
        actions.push(
          LIGHT_COMMAND_SEPARATOR,
          ...(await this.switchGroup.groupActions()),
        );
        break;
      case GROUP_TYPES.fan:
        actions.push(
          LIGHT_COMMAND_SEPARATOR,
          ...(await this.fanGroup.groupActions()),
        );
        break;
      case GROUP_TYPES.lock:
        actions.push(
          LIGHT_COMMAND_SEPARATOR,
          ...(await this.lockGroup.groupActions()),
        );
        break;
    }
    const action = await this.promptService.menu({
      keyMap: {
        d: ['Done', DONE],
        p: [
          this.pinnedItems.isPinned('group', group._id) ? 'Unpin' : 'Pin',
          'pin',
        ],
      },
      right: ToMenuEntry([
        ...actions,
        new inquirer.Separator(chalk.white`Management`),
        [`${ICONS.DELETE}Delete`, 'delete'],
        [`${ICONS.ENTITIES}Entities`, 'entities'],
        [`${ICONS.RENAME}Rename`, 'rename'],
        [`${ICONS.STATE_MANAGER}State Manager`, 'state'],
      ]),
      rightHeader: `Group action / management`,
      value: defaultValue,
    });
    switch (action) {
      case 'pin':
        this.pinnedItems.toggle({
          friendlyName: group.friendlyName,
          id: group._id,
          script: 'group',
        });
        return this.process(group, list, action);
      case 'entities':
        group = await this.updateEntities(group);
        return this.process(group, list, action);
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
        group = await this.update(group);
        break;
      case 'delete':
        if (
          !(await this.promptService.confirm(
            `Are you sure you want to delete ${chalk.magenta.bold(
              group.friendlyName,
            )}`,
          ))
        ) {
          return await this.process(group, list, action);
        }
        await this.fetchService.fetch({
          method: 'delete',
          url: `/group/${group._id}`,
        });
        return;
      default:
        switch (group.type) {
          case GROUP_TYPES.light:
            await this.lightGroup.processAction(group, action);
            break;
          case GROUP_TYPES.switch:
            await this.switchGroup.processAction(group, action);
            break;
          case GROUP_TYPES.fan:
            await this.fanGroup.processAction(group, action);
            break;
          case GROUP_TYPES.lock:
            await this.lockGroup.processAction(group, action);
            break;
        }
        this.logger.error({ action, type: group.type }, `Bad action`);
    }
    await this.process(group, list, action);
  }

  public async update(group: GroupDTO): Promise<GroupDTO> {
    return await this.fetchService.fetch({
      body: group,
      method: `put`,
      url: `/group/${group._id}`,
    });
  }

  protected onModuleInit(): void {
    this.pinnedItems.loaders.set('group', async ({ id }) => {
      const list = await this.list();
      const group = list.find(({ _id }) => _id === id);
      if (!group) {
        throw new InternalServerErrorException();
      }
      await this.process(group, list);
    });
  }

  private groupEntries(groups: GroupDTO[]): PromptEntry<GroupDTO>[] {
    const map = new Map<GROUP_TYPES, GroupDTO[]>();
    const out: PromptEntry<GroupDTO>[] = [];
    groups.forEach((group) => {
      const list = map.get(group.type) || [];
      list.push(group);
      map.set(group.type, list);
    });
    [...map.keys()]
      .sort((a, b) => (a > b ? UP : DOWN))
      .forEach((key) => {
        out.push(
          new inquirer.Separator(
            chalk.white(`${TitleCase(key, false)} Groups`),
          ),
        );
        map
          .get(key)
          .sort((a, b) => (a.friendlyName > b.friendlyName ? UP : DOWN))
          .forEach((group) => out.push([group.friendlyName, group]));
      });
    return out;
  }

  private async header(group: GroupDTO): Promise<void> {
    if (group.type === GROUP_TYPES.light) {
      return await this.lightGroup.header(group);
    }
    this.promptService.scriptHeader(`Group`);
    console.log(
      [
        [
          chalk.blue.bold`${group.friendlyName}`,
          chalk.yellow.bold`${TitleCase(group.type)} Group`,
        ].join(chalk.cyan(' - ')),
        ...group.entities
          .map((id) => chalk`  {cyan -} ${id}`)
          .sort((a, b) => (a > b ? UP : DOWN)),
        ``,
        ``,
      ].join(`\n`),
    );
  }

  private async updateEntities(group: GroupDTO): Promise<GroupDTO> {
    const action = await this.promptService.menu({
      right: ToMenuEntry([
        new inquirer.Separator(chalk.white`Maintenance`),
        [`${ICONS.CREATE}Add`, 'add'],
        [`${ICONS.DELETE}Remove`, 'delete'],
        ...this.promptService.conditionalEntries(!IsEmpty(group.entities), [
          new inquirer.Separator(chalk.white`Current entities`),
          ...(group.entities.map((i) => [i, i]) as PromptEntry[]),
        ]),
      ]),
      rightHeader: `Entity actions`,
    });
    switch (action) {
      case DONE:
        return group;
      case 'add':
        group.entities = [
          ...group.entities,
          ...(await this.entityService.buildList(
            GROUP_DOMAINS.get(group.type),
            { omit: group.entities },
          )),
        ];
        group = await this.update(group);
        return await this.updateEntities(group);
      case 'delete':
        group.entities = await this.promptService.pickMany(
          `Select entities to keep`,
          group.entities.map((i) => [i, i]),
          { default: group.entities },
        );
        group = await this.update(group);
        return await this.updateEntities(group);
    }
    await this.entityService.process(action);
    return group;
  }
}
