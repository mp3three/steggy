import { GroupDTO, RoomDTO, RoomEntityDTO } from '@for-science/controller-logic';
import { HASS_DOMAINS } from '@for-science/home-assistant';
import {
  DONE,
  ICONS,
  IsDone,
  PinnedItemService,
  PromptEntry,
  PromptService,
  Repl,
  ToMenuEntry,
} from '@for-science/tty';
import {
  AutoLogService,
  DOWN,
  FILTER_OPERATIONS,
  IsEmpty,
  UP,
} from '@for-science/utilities';
import { NotImplementedException } from '@nestjs/common';
import chalk from 'chalk';
import { encode } from 'ini';
import inquirer from 'inquirer';

import { GroupCommandService } from '../groups/group-command.service';
import { EntityService } from '../home-assistant/entity.service';
import { HomeFetchService } from '../home-fetch.service';
import { RoutineService } from '../routines';
import { RoomStateService } from './room-state.service';

const NAME = 0;

@Repl({
  category: `Control`,
  description: [
    `Rooms can contain groups and entitites, and are intended to manage the state of all items inside of it as a whole.`,
    `Rooms can observe entities for state changes, and trigger routines to make changes to the state.`,
  ],
  icon: ICONS.ROOMS,
  keybind: 'r',
  name: `Rooms`,
})
export class RoomCommandService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly promptService: PromptService,
    private readonly fetchService: HomeFetchService,
    private readonly groupCommand: GroupCommandService,
    private readonly entityService: EntityService,
    private readonly roomState: RoomStateService,
    private readonly pinnedItems: PinnedItemService,
    private readonly routineService: RoutineService,
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
        d: ['Done', DONE],
      },
      right: ToMenuEntry([
        ...this.promptService.conditionalEntries(!IsEmpty(rooms), [
          new inquirer.Separator(chalk.white`Existing rooms`),
          ...(rooms
            .map((room) => [room.friendlyName, room])
            .sort((a, b) => (a[NAME] > b[NAME] ? UP : DOWN)) as [
            string,
            RoomDTO,
          ][]),
        ]),
        new inquirer.Separator(chalk.white`Actions`),
        [`${ICONS.CREATE}Create`, 'create'],
      ]),
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
    if (typeof room === 'string') {
      throw new NotImplementedException();
    }
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
    current =
      typeof current === 'string'
        ? rooms.find(({ _id }) => _id === current)
        : current;
    const room = await this.promptService.pickOne<RoomDTO | string>(
      `Pick a room`,
      [
        [`${ICONS.CREATE}Create new`, `create`],
        ...this.promptService.conditionalEntries(
          !IsEmpty(rooms),
          rooms.map((room) => [room.friendlyName, room]),
        ),
      ],
      current,
    );
    if (room === `create`) {
      return await this.create();
    }
    if (typeof room === `string`) {
      throw new NotImplementedException();
    }
    return room;
  }

  public async processRoom(
    room: RoomDTO,
    defaultAction?: string,
  ): Promise<void> {
    this.promptService.clear();
    this.promptService.scriptHeader(room.friendlyName);
    if (!IsEmpty(room.entities)) {
      console.log(chalk.bold.blue`${ICONS.ENTITIES}Entities `);
      console.log(
        room.entities
          .map(({ entity_id }) => chalk`  {cyan.bold -} ${entity_id}`)
          .sort((a, b) => (a > b ? UP : DOWN))
          .join(`\n`),
      );
    }
    if (!IsEmpty(room.groups)) {
      if (!IsEmpty(room.entities)) {
        console.log();
      }
      console.log(chalk.bold.blue`${ICONS.GROUPS}Groups `);
      const groups = await this.groupCommand.list({
        filters: new Set([
          {
            field: '_id',
            operation: FILTER_OPERATIONS.in,
            value: room.groups.join(','),
          },
        ]),
      });
      console.log(
        groups
          .map(({ friendlyName }) => chalk`  {cyan.bold -} ${friendlyName}`)
          .sort((a, b) => (a > b ? UP : DOWN))
          .join(`\n`),
      );
    }
    console.log();

    room.save_states ??= [];
    const [routines, states, entities, groups] = [
      [`${ICONS.ROUTINE}Routines`, 'routines'],
      [`${ICONS.STATE_MANAGER}State Manager`, 'states'],
      [`${ICONS.ENTITIES}Entities`, 'entities'],
      [`${ICONS.GROUPS}Groups`, 'groups'],
    ] as PromptEntry[];
    const action = await this.promptService.menu({
      keyMap: {
        d: ['Done', DONE],
        e: entities,
        g: groups,
        p: [
          this.pinnedItems.isPinned('room', room._id) ? 'Unpin' : 'pin',
          'pin',
        ],
        r: routines,
        s: states,
      },
      right: ToMenuEntry([
        new inquirer.Separator(chalk.white`Maintenance`),
        routines,
        states,
        [`${ICONS.DESCRIBE}Describe`, 'describe'],
        entities,
        groups,
        [`${ICONS.RENAME}Rename`, 'rename'],
        [`${ICONS.DELETE}Delete`, 'delete'],
      ]),
      rightHeader: `Action`,
      value: defaultAction,
    });
    if (IsDone(action)) {
      return;
    }
    switch (action) {
      case 'pin':
        this.pinnedItems.toggle({
          friendlyName: room.friendlyName,
          id: room._id,
          script: 'room',
        });
        return await this.processRoom(room, action);
      case 'routines':
        await this.routineService.processRoom(room);
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
      case 'describe':
        console.log(encode(room));
        return await this.processRoom(room, action);
      case 'entities':
        room = await this.roomEntities(room);
        return await this.processRoom(room, action);
      case 'groups':
        await this.roomGroups(room);
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

  protected onModuleInit(): void {
    this.pinnedItems.loaders.set('room', async ({ id }) => {
      const room = await this.get(id);
      await this.processRoom(room);
    });
  }

  private async buildEntityList(omit: string[] = []): Promise<RoomEntityDTO[]> {
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
      { omit },
    );
    return ids.map((entity_id) => ({
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
        // pointless destructuring ftw
        const { _id } = await this.groupCommand.create();
        current.push(_id);
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
            .map((group) => [group.friendlyName, group]),
        );
        if (IsEmpty(selection)) {
          this.logger.warn(`No groups selected`);
        } else {
          current.push(...selection.map((item) => item._id));
        }
        return current;
    }
    this.logger.error({ action }, `Not implemented`);
    return current;
  }

  private async roomEntities(room: RoomDTO): Promise<RoomDTO> {
    const action = await this.promptService.menu({
      right: ToMenuEntry([
        ...this.promptService.conditionalEntries(!IsEmpty(room.entities), [
          new inquirer.Separator(chalk.white`Manipulate`),
          ...(room.entities.map(({ entity_id }) => [
            entity_id,
            entity_id,
          ]) as PromptEntry[]),
          new inquirer.Separator(chalk.white`Maintenance`),
          [`${ICONS.DELETE}Remove`, 'remove'],
        ]),
        [`${ICONS.CREATE}Add`, 'add'],
      ]),
      rightHeader: `Room entities`,
    });
    if (IsDone(action)) {
      return room;
    }
    if (action === 'add') {
      const entityAppend = await this.buildEntityList(
        room.entities.map((item) => item.entity_id),
      );
      if (IsEmpty(entityAppend)) {
        this.logger.debug(`Nothing to add`);
        return;
      }
      room.entities.push(...entityAppend);
      room = await this.update(room);
      return await this.roomEntities(room);
    }
    if (action === 'remove') {
      const entities = await this.promptService.pickMany(
        `Keep selected`,
        room.entities
          .map(({ entity_id }) => [entity_id, entity_id])
          .sort(([a], [b]) => (a > b ? UP : DOWN)) as PromptEntry[],
        { default: room.entities.map(({ entity_id }) => entity_id) },
      );
      room = await this.update({
        ...room,
        entities: room.entities.filter((item) =>
          entities.includes(item.entity_id),
        ),
      });
      return await this.roomEntities(room);
    }
    await this.entityService.process(action);
    return await this.roomEntities(room);
  }

  private async roomGroups(room: RoomDTO): Promise<void> {
    room.groups ??= [];
    if (IsEmpty(room.groups)) {
      this.logger.warn(`No current groups in room`);
    }
    const allGroups = await this.groupCommand.list();
    const action = await this.promptService.menu<GroupDTO>({
      right: ToMenuEntry([
        [`${ICONS.RENAME}Update`, 'update'],
        ...this.promptService.conditionalEntries(!IsEmpty(room.groups), [
          new inquirer.Separator(chalk.white(`Current groups`)),
          ...(allGroups
            .filter(({ _id }) => room.groups.includes(_id))
            .map((group) => [
              group.friendlyName,
              group,
            ]) as PromptEntry<GroupDTO>[]),
        ]),
      ]),
      rightHeader: `Room groups`,
    });
    switch (action) {
      case DONE:
        return;
      case 'update':
        const added = await this.groupCommand.pickMany([], room.groups);
        room.groups = added.map(({ _id }) => _id);
        room = await this.update(room);
        return await this.roomGroups(room);
    }
    if (typeof action === 'string') {
      this.logger.error({ action }, `Not implemented`);
      return;
    }
    await this.groupCommand.process(action, allGroups);
  }
}
