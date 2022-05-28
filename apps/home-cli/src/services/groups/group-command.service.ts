import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import { CacheManagerService, InjectCache } from '@steggy/boilerplate';
import {
  GeneralSaveStateDTO,
  GROUP_TYPES,
  GroupDTO,
  GroupSaveStateDTO,
} from '@steggy/controller-shared';
import { HASS_DOMAINS } from '@steggy/home-assistant-shared';
import {
  ApplicationManagerService,
  DONE,
  IsDone,
  KeyMap,
  MainMenuEntry,
  PromptEntry,
  PromptService,
  ScreenService,
  SyncLoggerService,
  ToMenuEntry,
} from '@steggy/tty';
import {
  ARRAY_OFFSET,
  DOWN,
  is,
  ResultControlDTO,
  TitleCase,
  UP,
} from '@steggy/utilities';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { MENU_ITEMS } from '../../includes';
import { ICONS, IS_PROBABLY_ID } from '../../types';
import { EntityService } from '../home-assistant/entity.service';
import { HomeFetchService } from '../home-fetch.service';
import { PinnedItemService } from '../pinned-item.service';
import { FanGroupCommandService } from './fan-group-command.service';
import { GroupStateService } from './group-state.service';
import { LightGroupCommandService } from './light-group-command.service';
import { LockGroupCommandService } from './lock-group-command.service';
import { SwitchGroupCommandService } from './switch-group-command.service';

export type GroupItem = { entities: string[]; name: string; room: string };

export const GROUP_DEFINITIONS = new Map<GROUP_TYPES, string>([
  [
    GROUP_TYPES.light,
    [
      'Light groups may only contain light entities.',
      'Allow a set of lights to operate together performing the same function.',
    ].join(`\n`),
  ],
  [GROUP_TYPES.fan, 'Fan groups may only contain fan entities'],
  [
    GROUP_TYPES.switch,
    [
      'Switch groups may contain entities from the following domains:',
      ` - switch`,
      ` - light`,
      ` - climate`,
      ` - media`,
      ` - fan`,
    ].join(`\n`),
  ],
  [GROUP_TYPES.lock, 'Lock groups may only contain locks'],
]);

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
const CACHE_KEY = `MENU_LAST_GROUP`;

// @Repl({
//   category: `Control`,
//   icon: ICONS.GROUPS,
//   keybind: 'g',
//   name: `Groups`,
// })
@Injectable()
export class GroupCommandService {
  constructor(
    @InjectCache()
    private readonly cache: CacheManagerService,
    private readonly logger: SyncLoggerService,
    private readonly fetchService: HomeFetchService,
    private readonly promptService: PromptService,
    private readonly entityService: EntityService,
    @Inject(forwardRef(() => GroupStateService))
    private readonly groupState: GroupStateService,
    private readonly lightGroup: LightGroupCommandService,
    private readonly fanGroup: FanGroupCommandService,
    private readonly lockGroup: LockGroupCommandService,
    private readonly pinnedItems: PinnedItemService,
    private readonly screenService: ScreenService,
    private readonly applicationManager: ApplicationManagerService,
    private readonly switchGroup: SwitchGroupCommandService,
  ) {}

  private lastGroup: string;

  public async createSaveCommand(
    group: GroupDTO,
    current: Partial<GeneralSaveStateDTO> = {},
  ): Promise<GeneralSaveStateDTO> {
    let state = await this.promptService.pickOne<GroupSaveStateDTO | string>(
      `${chalk.magenta.bold(group.friendlyName)} save state`,
      ToMenuEntry([
        [`${ICONS.CREATE}Create new state`, `create`],
        ...this.promptService.conditionalEntries(!is.empty(group.save_states), [
          new inquirer.Separator(chalk.white`Existing states`),
          ...(group.save_states.map(i => [
            i.friendlyName,
            i,
          ]) as PromptEntry<GroupSaveStateDTO>[]),
        ]),
      ]),
      group.save_states.find(({ id }) => id === current.state),
    );
    if (state === 'create') {
      group = await this.groupState.build(group);
      state = group.save_states[group.save_states.length - ARRAY_OFFSET];
      if (!state) {
        throw new InternalServerErrorException(`wat`);
      }
    }
    if (is.string(state)) {
      throw new NotImplementedException();
    }
    return {
      ref: group._id,
      state: state.id,
      type: 'group',
    };
  }

  public async exec(): Promise<void> {
    this.applicationManager.setHeader('All Groups');
    const groups = await this.list();
    const action = await this.promptService.menu<GroupDTO>({
      keyMap: { d: MENU_ITEMS.DONE },
      right: ToMenuEntry([
        ...this.promptService.conditionalEntries(
          !is.empty(groups),
          this.groupEntries(groups),
        ),
      ]),
      rightHeader: 'Pick group',
      value: this.lastGroup
        ? groups.find(({ _id }) => _id === this.lastGroup)
        : undefined,
    });
    if (IsDone(action)) {
      return;
    }
    if (is.string(action)) {
      this.logger.error({ action }, `Command not implemented`);
      return;
    }
    await this.cache.set(CACHE_KEY, action._id);
    this.lastGroup = action._id;
    await this.process(action, groups);
  }

  public async get(group: GroupDTO | string): Promise<GroupDTO> {
    return await this.fetchService.fetch({
      url: `/group/${is.string(group) ? group : group._id}`,
    });
  }

  public async getMap(): Promise<Map<string, GroupDTO>> {
    const groups = await this.list();
    return new Map(groups.map(i => [i._id, i]));
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
    let groups = await this.list();
    if (!is.empty(inList)) {
      groups = groups.filter(({ _id }) => inList.includes(_id));
    }
    return await this.promptService.listBuild({
      current: groups
        .filter(({ _id }) => current.includes(_id))
        .map(group => [group.friendlyName, group]),
      source: groups
        .filter(({ _id }) => !current.includes(_id))
        .map(group => [group.friendlyName, group]),
    });
  }

  public async pickOne(
    inList: string[] = [],
    defaultValue?: GroupDTO | string,
  ): Promise<GroupDTO> {
    const groups = await this.list();
    inList = is.empty(inList) ? groups.map(({ _id }) => _id) : inList;
    if (defaultValue) {
      defaultValue = groups.find(
        ({ _id }) =>
          _id === (is.string(defaultValue) ? defaultValue : defaultValue._id),
      );
    }
    return await this.promptService.pickOne(
      `Pick a group`,
      ToMenuEntry(
        groups
          .filter(group => inList.includes(group._id))
          .map(group => [group.friendlyName, group]),
      ),
      defaultValue,
    );
  }

  public async process(
    group: GroupDTO,
    list?: GroupDTO[],
    defaultValue?: string,
  ): Promise<void> {
    await this.header(group);
    const actions: PromptEntry[] = [];
    let map: KeyMap = {};
    switch (group.type) {
      case GROUP_TYPES.light:
        actions.push(...(await this.lightGroup.groupActions()));
        map = this.lightGroup.keyMap;
        break;
      case GROUP_TYPES.switch:
        actions.push(...(await this.switchGroup.groupActions()));
        map = this.switchGroup.keyMap;
        break;
      case GROUP_TYPES.fan:
        actions.push(...(await this.fanGroup.groupActions()));
        map = this.fanGroup.keyMap;
        break;
      case GROUP_TYPES.lock:
        actions.push(...(await this.lockGroup.groupActions()));
        map = this.lockGroup.keyMap;
        break;
    }
    const action = await this.promptService.menu<{ entity_id: string }>({
      keyMap: {
        a: [`Add entity`, 'add'],
        d: MENU_ITEMS.DONE,
        m: [`${ICONS.ENTITIES}Manage Entities`, 'entities'],
        p: [
          this.pinnedItems.isPinned('group', group._id) ? 'Unpin' : 'Pin',
          'pin',
        ],
        r: MENU_ITEMS.RENAME,
        x: MENU_ITEMS.DELETE,
        ...map,
      },
      left: group.entities.map(entity_id => ({
        entry: [entity_id, { entity_id }],
        type: 'Entities',
      })),
      right: [
        ...actions.map(
          entry =>
            ({
              entry,
              type: 'Actions',
            } as MainMenuEntry<string>),
        ),
        ...group.save_states.map(
          state =>
            ({
              entry: [state.friendlyName, state.id],
              type: 'Save State',
            } as MainMenuEntry<string>),
        ),
      ],
      showHeaders: false,
      value: defaultValue,
    });
    if (IsDone(action)) {
      return;
    }
    if (!is.string(action)) {
      return await this.entityService.process(action.entity_id);
    }
    switch (action) {
      case 'pin':
        await this.pinnedItems.toggle({
          target: group._id,
          type: 'group',
        });
        return this.process(group, list, action);
      case 'add':
        group.entities = [
          ...group.entities,
          ...(await this.entityService.buildList(
            GROUP_DOMAINS.get(group.type),
            { omit: group.entities },
          )),
        ];
        group = await this.update(group);
        return this.process(group, list, action);
      case 'entities':
        this.screenService.print(`Select entities to keep`);
        group.entities = await this.promptService.listBuild({
          current: group.entities.map(i => [i, i]),
          source: [],
        });
        group = await this.update(group);
        return this.process(group, list, action);
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
        if (IS_PROBABLY_ID(action)) {
          this.groupState.activate(group, action);
          break;
        }
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

  protected async onModuleInit(): Promise<void> {
    this.lastGroup = await this.cache.get(CACHE_KEY);
    this.pinnedItems.loaders.set('group', async ({ target }) => {
      const list = await this.list();
      const group = list.find(({ _id }) => _id === target);
      if (!group) {
        throw new InternalServerErrorException();
      }
      await this.process(group, list);
    });
  }

  private groupEntries(groups: GroupDTO[]): PromptEntry<GroupDTO>[] {
    const map = new Map<GROUP_TYPES, GroupDTO[]>();
    const out: PromptEntry<GroupDTO>[] = [];
    groups.forEach(group => {
      const list = map.get(group.type) || [];
      list.push(group);
      map.set(group.type, list);
    });
    [...map.keys()]
      .sort((a, b) => (a > b ? UP : DOWN))
      .forEach(key => {
        out.push(
          new inquirer.Separator(
            chalk.white(`${TitleCase(key, false)} Groups`),
          ),
        );
        map
          .get(key)
          .sort((a, b) => (a.friendlyName > b.friendlyName ? UP : DOWN))
          .forEach(group => out.push([group.friendlyName, group]));
      });
    return out;
  }

  private async header(group: GroupDTO): Promise<void> {
    if (group.type === GROUP_TYPES.light) {
      return await this.lightGroup.header(group);
    }
    this.applicationManager.setHeader(
      group.friendlyName,
      `${TitleCase(group.type)} Group`,
    );
  }
}
