import {
  forwardRef,
  Inject,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import { CacheManagerService, InjectCache } from '@steggy/boilerplate';
import { GroupDTO, RoomDTO, RoomEntityDTO } from '@steggy/controller-shared';
import { HASS_DOMAINS } from '@steggy/home-assistant-shared';
import {
  ApplicationManagerService,
  IsDone,
  MainMenuEntry,
  PromptEntry,
  PromptService,
  SyncLoggerService,
  ToMenuEntry,
} from '@steggy/tty';
import {
  DOWN,
  FILTER_OPERATIONS,
  is,
  LABEL,
  ResultControlDTO,
  UP,
} from '@steggy/utilities';
import chalk from 'chalk';

import { MENU_ITEMS } from '../../includes';
import { ICONS } from '../../types';
import { GroupCommandService } from '../groups/group-command.service';
import { EntityService } from '../home-assistant/entity.service';
import { HomeFetchService } from '../home-fetch.service';
import { MetadataService } from '../metadata.service';
import { PinnedItemService } from '../pinned-item.service';
import { RoomStateService } from './room-state.service';

const CACHE_KEY = 'MENU_LAST_ROOM';

// @Repl({
//   category: `Control`,
//   icon: ICONS.ROOMS,
//   keybind: 'r',
//   name: `Rooms`,
// })
@Injectable()
export class RoomCommandService {
  constructor(
    private readonly applicationManager: ApplicationManagerService,
    @InjectCache()
    private readonly cache: CacheManagerService,
    private readonly entityService: EntityService,
    private readonly fetchService: HomeFetchService,
    private readonly groupCommand: GroupCommandService,
    private readonly logger: SyncLoggerService,
    @Inject(forwardRef(() => MetadataService))
    private readonly metadataService: MetadataService<RoomDTO>,
    private readonly pinnedItems: PinnedItemService,
    private readonly promptService: PromptService,
    private readonly roomState: RoomStateService,
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
      keyMap: { d: MENU_ITEMS.DONE },
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

  public async list(control?: ResultControlDTO): Promise<RoomDTO[]> {
    return await this.fetchService.fetch({
      control,
      url: `/room`,
    });
  }

  public async pickMany(
    inList: string[] = [],
    current: string[] = [],
  ): Promise<RoomDTO[]> {
    let rooms = await this.list();
    if (!is.empty(inList)) {
      rooms = rooms.filter(({ _id }) => inList.includes(_id));
    }
    return await this.promptService.listBuild({
      current: rooms
        .filter(({ _id }) => current.includes(_id))
        .map(room => [room.friendlyName, room]),
      source: rooms
        .filter(({ _id }) => !current.includes(_id))
        .map(room => [room.friendlyName, room]),
    });
  }

  public async pickOne(current?: RoomDTO | string): Promise<RoomDTO> {
    const rooms = await this.list();
    current = is.string(current)
      ? rooms.find(({ _id }) => _id === current)
      : current;
    const room = await this.promptService.pickOne<RoomDTO | string>(
      `Pick a room`,
      ToMenuEntry([
        [`${ICONS.CREATE}Create new`, `create`],
        ...this.promptService.conditionalEntries(
          !is.empty(rooms),
          rooms.map(room => [room.friendlyName, room]),
        ),
      ]),
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

    room.metadata ??= [];
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
        x: MENU_ITEMS.DELETE,
      },
      left: [
        ...(is.empty(room.entities)
          ? []
          : (room.entities.map(({ entity_id }) => {
              return { entry: [entity_id, { entity_id }], type: 'Entity' };
            }) as MainMenuEntry<{ entity_id: string }>[])),
        ...(is.empty(groups)
          ? []
          : (groups.map(group => {
              return { entry: [group.friendlyName, group], type: 'Group' };
            }) as MainMenuEntry<GroupDTO>[])),
      ],
      right: [
        { entry: MENU_ITEMS.ENTITIES, type: 'Manage' },
        { entry: MENU_ITEMS.GROUPS, type: 'Manage' },
        ...room.save_states.map(
          state =>
            ({
              entry: [state.friendlyName, state.id],
              type: 'Save States',
            } as MainMenuEntry<string>),
        ),
        ...room.metadata.map(
          metadata =>
            ({
              entry: [
                chalk`{gray (${metadata.type})} ${metadata.name}`,
                metadata.id,
              ],
              helpText: chalk`{green.bold Current Value}: ${metadata.value}${
                metadata.description ? `\n${metadata.description}` : ''
              }`,
              type: 'Metadata',
            } as MainMenuEntry<string>),
        ),
      ],
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
          target: room._id,
          type: 'room',
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
      default:
        const isMetadata = room.metadata.find(({ id }) => id === action);
        if (isMetadata) {
          room = await this.metadataService.setValue(room, 'room', action);
          return await this.processRoom(room, action);
        }
        await this.roomState.activate(room, action);
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
    this.pinnedItems.loaders.set('room', async ({ target }) => {
      const room = await this.get(target);
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
      ToMenuEntry([
        [`${ICONS.GROUPS}Use existing`, 'existing'],
        [`Done`, 'done'],
      ]),
      `Room groups`,
    );
    switch (action) {
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
}
