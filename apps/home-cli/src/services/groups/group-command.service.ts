import {
  GROUP_TYPES,
  GroupDTO,
  GroupSaveStateDTO,
  RoomEntitySaveStateDTO,
} from '@automagical/controller-logic';
import { HASS_DOMAINS } from '@automagical/home-assistant';
import {
  DONE,
  ICONS,
  iRepl,
  PromptEntry,
  PromptService,
  Repl,
} from '@automagical/tty';
import {
  AutoLogService,
  IsEmpty,
  ResultControlDTO,
  TitleCase,
} from '@automagical/utilities';
import {
  forwardRef,
  Inject,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { EntityService } from '../entity.service';
import { HomeFetchService } from '../home-fetch.service';
import { GroupStateService } from './group-state.service';
import { LightGroupCommandService } from './light-group-command.service';

export type GroupItem = { entities: string[]; name: string; room: string };
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

const ARRAY_OFFSET = 1;
const UP = 1;
const DOWN = -1;

@Repl({
  category: `Control`,
  description: [
    `Groups are collections of like entities that all act in a coordinated way.`,
    ``,
    ` - Light Group`,
    ` - Switch Group`,
    ` - Lock Group`,
    ` - Fan Group`,
  ],
  icon: ICONS.GROUPS,
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
  ) {}
  private lastGroup: string;

  public async create(): Promise<GroupDTO> {
    const type = await this.promptService.pickOne(
      `What type of group?`,
      Object.values(GROUP_TYPES).map((type) => [TitleCase(type), type]),
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
    const action = await this.promptService.menuSelect<GroupDTO>(
      [
        ...this.promptService.conditionalEntries(!IsEmpty(groups), [
          new inquirer.Separator(chalk.white`Existing groups`),
          ...groups.map((group) => [group.friendlyName, group]),
        ] as PromptEntry<GroupDTO>[]),
        new inquirer.Separator(chalk.white`Actions`),
        [`${ICONS.CREATE}Create Group`, 'create'],
      ],
      'Pick group',
      this.lastGroup
        ? groups.find(({ _id }) => _id === this.lastGroup)
        : undefined,
    );
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
    );
  }

  public async process(
    group: GroupDTO,
    list: GroupDTO[],
    defaultValue?: string,
  ): Promise<void> {
    this.header(group);
    const actions: PromptEntry[] = [];
    if (group.type === GROUP_TYPES.light) {
      actions.push(
        new inquirer.Separator(chalk.white('Light commands')),
        ...(await this.lightGroup.groupActions()),
      );
    }
    const action = await this.promptService.menuSelect(
      [
        ...actions,
        new inquirer.Separator(chalk.white`Management`),
        [`${ICONS.DELETE}Delete`, 'delete'],
        [`${ICONS.ENTITIES}Entities`, 'entities'],
        [`${ICONS.RENAME}Rename`, 'rename'],
        [`${ICONS.STATE_MANAGER}State Manager`, 'state'],
      ],
      `Group action / management`,
      defaultValue,
    );
    switch (action) {
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
        if (group.type === GROUP_TYPES.light) {
          await this.lightGroup.processAction(group, action);
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

  private header(group: GroupDTO): void {
    this.promptService.scriptHeader(`Group`);
    console.log(
      [
        [
          chalk.magenta.bold`${group.friendlyName}`,
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
    const action = await this.promptService.menuSelect(
      [
        new inquirer.Separator(chalk.white`Maintenance`),
        [`${ICONS.CREATE}Add`, 'add'],
        [`${ICONS.DELETE}Remove`, 'delete'],
        ...this.promptService.conditionalEntries(!IsEmpty(group.entities), [
          new inquirer.Separator(chalk.white`Current entities`),
          ...(group.entities.map((i) => [i, i]) as PromptEntry[]),
        ]),
      ],
      `Entity actions`,
    );
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
