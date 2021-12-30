/* eslint-disable radar/no-identical-functions */
import {
  forwardRef,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotImplementedException,
} from '@nestjs/common';
import {
  RoomDTO,
  RoomEntitySaveStateDTO,
  RoomStateDTO,
} from '@text-based/controller-logic';
import { domain, HASS_DOMAINS } from '@text-based/home-assistant';
import {
  ICONS,
  IsDone,
  PinnedItemService,
  PromptEntry,
  PromptService,
  ToMenuEntry,
} from '@text-based/tty';
import {
  AutoLogService,
  DOWN,
  FILTER_OPERATIONS,
  is,
  LABEL,
  UP,
  VALUE,
} from '@text-based/utilities';
import { eachSeries } from 'async';
import chalk from 'chalk';
import Table from 'cli-table';

import { MENU_ITEMS } from '../../includes';
import { GroupCommandService } from '../groups';
import { EntityService } from '../home-assistant';
import { HomeFetchService } from '../home-fetch.service';
import { RoomCommandService } from './room-command.service';

type RCService = RoomCommandService;
@Injectable()
export class RoomStateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    @Inject(forwardRef(() => RoomCommandService))
    private readonly roomService: RCService,
    private readonly entityService: EntityService,
    private readonly groupService: GroupCommandService,
    private readonly fetchService: HomeFetchService,
    private readonly pinnedItems: PinnedItemService<{ room: string }>,
  ) {}

  public async activate(room: RoomDTO, state: RoomStateDTO): Promise<void> {
    await this.fetchService.fetch({
      method: `post`,
      url: `/room/${room._id}/state/${state.id}`,
    });
  }

  public async build(
    room: RoomDTO,
    current: Partial<RoomStateDTO> = {},
  ): Promise<RoomStateDTO> {
    current.friendlyName =
      current.friendlyName ??
      (await this.promptService.friendlyName(current.friendlyName));
    current.states ??= [];
    const states: RoomEntitySaveStateDTO[] = [
      ...(await this.buildEntities(room, current)),
      ...(await this.buildGroups(room, current)),
    ];
    // This log mostly exists to provide visual context after building group states
    // Easy to totally get lost
    console.log(chalk.gray`Saving state ${current.friendlyName}`);
    current.states = states;
    if (!current.id) {
      return await this.fetchService.fetch({
        body: current,
        method: 'post',
        url: `/room/${room._id}/state`,
      });
    }
    return await this.fetchService.fetch({
      body: current,
      method: 'put',
      url: `/room/${room._id}/state/${current.id}`,
    });
  }

  public async pickOne(room: RoomDTO, current?: RoomStateDTO): Promise<string> {
    const action = await this.promptService.menu({
      keyMap: { c: MENU_ITEMS.CREATE },
      right: ToMenuEntry(
        room.save_states.map((state) => [state.friendlyName, state]),
      ),
      value: current,
    });
    if (action === 'create') {
      const state = await this.build(room);
      return state.id;
    }
    if (is.string(action)) {
      throw new NotImplementedException();
    }
    return action.id;
  }

  public async process(room: RoomDTO): Promise<RoomDTO> {
    this.promptService.clear();
    this.promptService.scriptHeader(room.friendlyName);
    this.promptService.secondaryHeader('Room States');
    const action = await this.promptService.menu({
      keyMap: {
        a: MENU_ITEMS.ACTIVATE,
        c: MENU_ITEMS.CREATE,
        d: MENU_ITEMS.DONE,
        f12: [`${ICONS.DESTRUCTIVE}Remove all save states`, 'truncate'],
      },
      keyMapCallback: async (action: string, [name, target]) => {
        if (is.string(target) || action !== 'activate') {
          return true;
        }
        await this.activate(room, target as RoomStateDTO);
        return chalk.magenta.bold(MENU_ITEMS.ACTIVATE[LABEL]) + ' ' + name;
      },
      right: ToMenuEntry(
        room.save_states
          .map((state) => [state.friendlyName, state])
          .sort(([a], [b]) =>
            a > b ? UP : DOWN,
          ) as PromptEntry<RoomStateDTO>[],
      ),
      rightHeader: `Pick state`,
    });
    if (IsDone(action)) {
      return room;
    }
    switch (action) {
      case 'create':
        await this.build(room);
        room = await this.roomService.get(room._id);
        return await this.process(room);
      case 'truncate':
        if (
          !(await this.promptService.confirm(
            `This is a desctructive operation, are you sure?`,
          ))
        ) {
          return await this.process(room);
        }
        room.save_states = [];
        room = await this.roomService.update(room);
        return await this.process(room);
    }
    if (is.string(action)) {
      throw new NotImplementedException();
    }
    room = await this.processState(room, action);
    return await this.process(room);
  }

  public async processState(
    room: RoomDTO,
    state: RoomStateDTO,
    defaultAction?: string,
  ): Promise<RoomDTO> {
    if (defaultAction !== 'activate') {
      this.promptService.clear();
      this.promptService.scriptHeader(room.friendlyName);
      this.promptService.secondaryHeader(state.friendlyName);
    }
    let action = await this.promptService.menu({
      keyMap: {
        a: MENU_ITEMS.ACTIVATE,
        d: MENU_ITEMS.DONE,
        e: MENU_ITEMS.EDIT,
        f1: MENU_ITEMS.DESCRIBE,
        n: MENU_ITEMS.RENAME,
        p: [
          this.pinnedItems.isPinned('room_state', state.id) ? 'Unpin' : 'Pin',
          'pin',
        ],
        r: [`${ICONS.ROOMS}Go to room`, `room`],
        x: MENU_ITEMS.DELETE,
      },
      keyMapCallback: (action) => {
        if (action !== MENU_ITEMS.ACTIVATE[VALUE]) {
          return true;
        }
        process.nextTick(async () => {
          await this.activate(room, state);
        });
        return chalk.magenta.bold(MENU_ITEMS.ACTIVATE[LABEL]);
      },
      keyOnly: true,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return room;
    }
    action ??= 'activate';
    switch (action) {
      case 'describe':
        await this.header(room, state);
        return await this.processState(room, state, action);
      case 'rename':
        state.friendlyName = await this.promptService.friendlyName(
          state.friendlyName,
        );
        await this.update(state, room);
        return await this.processState(room, state, action);
      case 'room':
        await this.roomService.processRoom(room);
        room = await this.roomService.get(room._id);
        return room;
      case 'pin':
        this.pinnedItems.toggle({
          data: { room: room._id },
          friendlyName: state.friendlyName,
          id: state.id,
          script: 'room_state',
        });
        return await this.processState(room, state, action);
      case 'activate':
        await this.activate(room, state);
        return await this.processState(room, state, action);
      case 'edit':
        const update = await this.build(room, state);
        room = await this.roomService.get(room._id);
        return await this.processState(room, update);
      case 'delete':
        if (
          !(await this.promptService.confirm(
            `Are you sure you want to delete ${chalk.magenta.bold(
              state.friendlyName,
            )}? This cannot be undone`,
          ))
        ) {
          return await this.processState(room, state);
        }
        return await this.fetchService.fetch({
          method: 'delete',
          url: `/room/${room._id}/state/${state.id}`,
        });
    }
    throw new NotImplementedException();
  }

  public async update(current: RoomStateDTO, room: RoomDTO): Promise<void> {
    return await this.fetchService.fetch({
      body: current,
      method: 'put',
      url: `/room/${room._id}/state/${current.id}`,
    });
  }

  protected onModuleInit(): void {
    this.pinnedItems.loaders.set('room_state', async ({ id, data }) => {
      const room = await this.roomService.get(data.room);
      const state = room.save_states.find((state) => state.id === id);
      if (!state) {
        throw new InternalServerErrorException();
      }
      await this.processState(room, state);
    });
  }

  private async buildEntities(
    room: RoomDTO,
    current: Partial<RoomStateDTO> = {},
  ): Promise<RoomEntitySaveStateDTO[]> {
    if (is.empty(room.entities)) {
      this.logger.warn(`No entities in room`);
      return [];
    }

    const states: RoomEntitySaveStateDTO[] = [];
    const list = await this.entityService.pickMany(
      // Filter out non-actionable domains
      room.entities
        .map(({ entity_id }) => entity_id)
        .filter(
          (entity_id) => ![HASS_DOMAINS.sensor].includes(domain(entity_id)),
        ),
      current.states
        .filter((state) => state.type === 'entity' && state.ref.includes('.'))
        .map(({ ref }) => ref),
    );
    // Things tend to do the same thing
    // Makes initial setup easier
    let lastState: RoomEntitySaveStateDTO;
    await eachSeries(list, async (entity_id) => {
      const found = current.states.find((i) => i.ref === entity_id) || {
        ...lastState,
        ref: entity_id,
      };
      const state = await this.entityService.createSaveCommand(
        entity_id,
        found,
      );
      lastState = state;
      state.type = 'entity';
      states.push(state);
    });
    return states;
  }

  private async buildGroups(
    room: RoomDTO,
    current: Partial<RoomStateDTO> = {},
  ): Promise<RoomEntitySaveStateDTO[]> {
    if (is.empty(room.groups)) {
      this.logger.warn(`No groups`);
      return [];
    }
    const states: RoomEntitySaveStateDTO[] = [];
    const list = await this.groupService.pickMany(
      room.groups,
      current.states
        .filter(({ type }) => type === 'group')
        .map(({ ref }) => ref),
    );
    await eachSeries(list, async (group) => {
      const state = await this.groupService.createSaveCommand(
        group,
        current.states.find((i) => i.ref === group._id),
      );
      state.type = 'group';
      states.push(state);
    });
    return states;
  }

  private async header(room: RoomDTO, state: RoomStateDTO): Promise<void> {
    console.log(
      chalk`  ${
        ICONS.LINK
      }{bold.magenta POST} {underline ${this.fetchService.getUrl(
        `/room/${room._id}/state/${state.id}`,
      )}}`,
    );
    const entities = state.states.filter(({ type }) => type === 'entity');
    if (is.empty(entities)) {
      console.log(
        chalk`  ${ICONS.ENTITIES} {blue No entities included in save state}\n`,
      );
    } else {
      const table = new Table({
        head: ['Entity ID', 'State', 'Extra'],
      });
      entities
        .sort((a, b) => (a.ref > b.ref ? UP : DOWN))
        .forEach((entity) => {
          table.push([
            entity.ref ?? '',
            entity.state ?? '',
            this.promptService.objectPrinter(entity.extra),
          ]);
        });
      console.log(
        [
          ``,
          chalk`  ${ICONS.ENTITIES}{blue.bold Entity States}`,
          table.toString(),
        ].join(`\n`),
      );
    }
    const groupStates = state.states.filter(({ type }) => type === 'group');
    if (is.empty(groupStates)) {
      console.log(
        chalk`  ${ICONS.GROUPS}{blue No groups included in save state}\n`,
      );
      return;
    }
    const table = new Table({
      head: ['Entity ID', 'State'],
    });
    const ids = is.unique(groupStates.map(({ ref }) => ref));
    const groups = await this.groupService.list({
      filters: new Set([
        {
          field: '_id',
          operation: FILTER_OPERATIONS.in,
          value: ids,
        },
      ]),
    });
    groupStates.forEach((state) => {
      const group = groups.find(({ _id }) => _id === state.ref);
      const saveState = group.save_states.find(({ id }) => id === state.state);
      table.push([group.friendlyName, saveState?.friendlyName]);
    });
    console.log(
      [
        ``,
        chalk`  ${ICONS.GROUPS}{blue.bold Group States}`,
        table.toString(),
        ``,
      ].join(`\n`),
    );
  }
}
