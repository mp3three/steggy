import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
} from '@steggy/boilerplate';
import {
  GroupDTO,
  RoomDTO,
  RoomEntityDTO,
} from '@steggy/controller-shared';
import { HASS_DOMAINS } from '@steggy/home-assistant-shared';
import {
  ApplicationManagerService,
  ICONS,
  IsDone,
  PinnedItemService,
  PromptEntry,
  PromptService,
  Repl,
  ToMenuEntry,
} from '@steggy/tty';
import { DOWN, FILTER_OPERATIONS, is, LABEL, UP } from '@steggy/utilities';
import { NotImplementedException } from '@nestjs/common';
import chalk from 'chalk';
import inquirer from 'inquirer';

import { MENU_ITEMS } from '../../includes';
import { GroupCommandService } from '../groups/group-command.service';
import { EntityService } from '../home-assistant/entity.service';
import { HomeFetchService } from '../home-fetch.service';
import { RoutineService } from '../routines';
import { RoomStateService } from './room-state.service';

const CACHE_KEY = 'MENU_LAST_ROOM';

@Repl({
  category: `Control`,
  icon: ICONS.ROOMS,
  keybind: 'r',
  name: `Rooms`,
})
export class RoomCommandService {
  constructor(
    @InjectCache()
    private readonly cache: CacheManagerService,
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly groupCommand: GroupCommandService,
    private readonly entityService: EntityService,
    private readonly roomState: RoomStateService,
    private readonly pinnedItems: PinnedItemService,
    private readonly routineService: RoutineService,
    private readonly applicationManager: ApplicationManagerService,
  ) {}

  private lastRoom: string;

  public async create(): Promise<RoomDTO> {
    const friendlyName = await this.promptService.friendlyName();
    const entities = (await this.promptService.confirm(`Add entities?`, true))
      ? await this.buildEntityList()
      : [];
    const groups = (await this.promptService.confirm(`Add groups?`, true))
      ? await this.groupBuilder()
      : [];
    return await this.fetchService.fetch({
      body: {
        entities,
        friendlyName,
        groups,
      } as RoomDTO,
      method: 'post',
      url: `/room`,
    });
  }

  public async exec(): Promise<void> {
    const rooms = await this.list();
    let room = await this.promptService.menu<RoomDTO | string>({
      keyMap: {
        c: MENU_ITEMS.CREATE,
        d: MENU_ITEMS.DONE,
      },
      right: ToMenuEntry(
        rooms
          .map(room => [room.friendlyName, room] as PromptEntry<RoomDTO>)
          .sort((a, b) => (a[LABEL] > b[LABEL] ? UP : DOWN)),
      ),
      rightHeader: `Pick room`,
      value: this.lastRoom
        ? rooms.find(({ _id }) => _id === this.lastRoom)
        : undefined,
    });
    if (IsDone(room)) {
      return;
    }
    if (room === 'create') {
      room = await this.create();
    }
    if (is.string(room)) {
      throw new NotImplementedException();
    }
    await this.cache.set(CACHE_KEY, room._id);
    this.lastRoom = room._id;
    return await this.processRoom(room);
  }

  public async get(id: string): Promise<RoomDTO> {
    return await this.fetchService.fetch({
      url: `/room/${id}`,
    });
  }

  public async list(): Promise<RoomDTO[]> {
    return await this.fetchService.fetch({
      url: `/room`,
    });
  }

  public async pickOne(current?: RoomDTO | string): Promise<RoomDTO> {
    const rooms = await this.list();
    current = is.string(current)
      ? rooms.find(({ _id }) => _id === current)
      : current;
    const room = await this.promptService.pickOne<RoomDTO | string>(
      `Pick a room`,
      [
        [`${ICONS.CREATE}Create new`, `create`],
        ...this.promptService.conditionalEntries(
          !is.empty(rooms),
          rooms.map(room => [room.friendlyName, room]),
        ),
      ],
      current,
    );
    if (room === `create`) {
      return await this.create();
    }
    if (is.string(room)) {
      throw new NotImplementedException();
    }
    return room;
  }

  public async processRoom(
    room: RoomDTO,
    defaultAction?: string,
  ): Promise<void> {
    this.applicationManager.setHeader(room.friendlyName);

    const groups = is.empty(room.groups)
      ? []
      : await this.groupCommand.list({
          filters: new Set([
            {
              field: '_id',
              operation: FILTER_OPERATIONS.in,
              value: room.groups.join(','),
            },
          ]),
        });

    room.save_states ??= [];
    const action = await this.promptService.menu<
      GroupDTO | { entity_id: string }
    >({
      keyMap: {
        d: MENU_ITEMS.DONE,
        e: MENU_ITEMS.ENTITIES,
        g: MENU_ITEMS.GROUPS,
        p: [
          this.pinnedItems.isPinned('room', room._id) ? 'Unpin' : 'pin',
          'pin',
        ],
        r: MENU_ITEMS.RENAME,
        s: MENU_ITEMS.STATE_MANAGER,
        x: MENU_ITEMS.DELETE,
      },
      left: ToMenuEntry([
        ...this.promptService.conditionalEntries(!is.empty(room.entities), [
          new inquirer.Separator('Entities'),
          ...(room.entities.map(({ entity_id }) => {
            return [entity_id, { entity_id }];
          }) as PromptEntry<{ entity_id: string }>[]),
        ]),
        ...this.promptService.conditionalEntries(!is.empty(groups), [
          new inquirer.Separator('Groups'),
          ...(groups.map(group => {
            return [group.friendlyName, group];
          }) as PromptEntry<GroupDTO>[]),
        ]),
      ] as PromptEntry[]),
      right: ToMenuEntry([
        MENU_ITEMS.ROUTINES,
        MENU_ITEMS.STATE_MANAGER,
        MENU_ITEMS.ENTITIES,
        MENU_ITEMS.GROUPS,
      ]),
      showHeaders: false,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return;
    }
    if (is.object(action)) {
      if (GroupDTO.isGroup(action)) {
        return await this.groupCommand.process(action);
      }
      return await this.entityService.process(action.entity_id);
    }
    switch (action) {
      case 'pin':
        this.pinnedItems.toggle({
          friendlyName: room.friendlyName,
          id: room._id,
          script: 'room',
        });
        return await this.processRoom(room, action);
      case 'states':
        room = await this.roomState.process(room);
        return await this.processRoom(room, action);
      case 'rename':
        room.friendlyName = await this.promptService.string(
          `New name`,
          room.friendlyName,
        );
        room = await this.update(room);
        return await this.processRoom(room, action);
      case 'entities':
        room.entities = await this.buildEntityList(
          room.entities.map(item => item.entity_id),
        );
        room = await this.update(room);
        return await this.processRoom(room, action);
      case 'delete':
        if (
          !(await this.promptService.confirm(
            `Are you sure you want to delete ${chalk.magenta.bold(
              room.friendlyName,
            )}`,
          ))
        ) {
          return await this.processRoom(room, action);
        }
        await this.fetchService.fetch({
          method: 'delete',
          url: `/room/${room._id}`,
        });
        return;
      case 'groups':
        const added = await this.groupCommand.pickMany([], room.groups);
        room.groups = added.map(({ _id }) => _id);
        room = await this.update(room);
        return await this.processRoom(room, action);
    }
  }

  public async update(body: RoomDTO): Promise<RoomDTO> {
    return await this.fetchService.fetch({
      body,
      method: 'put',
      url: `/room/${body._id}`,
    });
  }

  protected async onModuleInit(): Promise<void> {
    this.lastRoom = await this.cache.get(CACHE_KEY);
    this.pinnedItems.loaders.set('room', async ({ id }) => {
      const room = await this.get(id);
      await this.processRoom(room);
    });
  }

  private async buildEntityList(
    current: string[] = [],
  ): Promise<RoomEntityDTO[]> {
    const ids = await this.entityService.buildList(
      [
        HASS_DOMAINS.climate,
        HASS_DOMAINS.fan,
        HASS_DOMAINS.light,
        HASS_DOMAINS.lock,
        HASS_DOMAINS.media_player,
        HASS_DOMAINS.sensor,
        HASS_DOMAINS.switch,
      ],
      { current },
    );
    return ids.map(entity_id => ({
      entity_id,
    }));
  }

  private async groupBuilder(current: string[] = []): Promise<string[]> {
    const action = await this.promptService.pickOne(
      `Group actions`,
      [
        [`${ICONS.GROUPS}Use existing`, 'existing'],
        [`${ICONS.CREATE}Create new`, 'create'],
        [`Done`, 'done'],
      ],
      `Room groups`,
    );
    switch (action) {
      //
      case 'create':
        const group = await this.groupCommand.create();
        if (!group) {
          return await this.groupBuilder(current);
        }
        current.push(group._id);
        return await this.groupBuilder(current);
      // Eject!
      case 'done':
        return current;
      //
      case 'existing':
        const groups = await this.groupCommand.list();
        const selection = await this.promptService.pickMany(
          `Groups to attach`,
          groups
            .filter(({ _id }) => !current.includes(_id))
            .map(group => [group.friendlyName, group]),
        );
        if (is.empty(selection)) {
          this.logger.warn(`No groups selected`);
        } else {
          current.push(...selection.map(item => item._id));
        }
        return current;
    }
    this.logger.error({ action }, `Not implemented`);
    return current;
  }

  private async removeEntities(room: RoomDTO): Promise<RoomDTO> {
    const entities = await this.promptService.pickMany(
      `Keep selected`,
      room.entities
        .map(({ entity_id }) => [entity_id, entity_id])
        .sort(([a], [b]) => (a > b ? UP : DOWN)) as PromptEntry[],
      { default: room.entities.map(({ entity_id }) => entity_id) },
    );
    return await this.update({
      ...room,
      entities: room.entities.filter(item => entities.includes(item.entity_id)),
    });
  }
}
