import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  CloneRoomDTO,
  GroupDTO,
  RoomDTO,
  RoomEntityDTO,
  RoomMetadataDTO,
  RoomStateDTO,
  RoutineCommandDTO,
  RoutineCommandRoomStateDTO,
} from '@steggy/controller-shared';
import { EntityManagerService } from '@steggy/home-assistant';
import { BaseSchemaDTO } from '@steggy/persistence';
import { each, is, ResultControlDTO } from '@steggy/utilities';
import { isDateString, isNumberString } from 'class-validator';
import EventEmitter from 'eventemitter3';
import { v4 as uuid } from 'uuid';

import { MetadataUpdate, ROOM_METADATA_UPDATED } from '../typings';
import { ChronoService } from './chrono.service';
import { EntityCommandRouterService } from './entities/entity-command-router.service';
import { GroupService } from './group.service';
import { RoomPersistenceService } from './persistence';
import { RoutineService } from './routine.service';

@Injectable()
export class RoomService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly roomPersistence: RoomPersistenceService,
    private readonly routineService: RoutineService,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
    private readonly commandRouter: EntityCommandRouterService,
    private readonly entityManager: EntityManagerService,
    private readonly eventEmitter: EventEmitter,
    private readonly chronoService: ChronoService,
  ) {}

  public async activateState(
    command: RoutineCommandRoomStateDTO,
    waitForChange = false,
  ): Promise<void> {
    const room = await this.load(command.room);
    const state = room.save_states.find(({ id }) => id === command.state);
    if (!state) {
      this.logger.error(
        `[${room.friendlyName}] Cannot find save state {${command.state}}`,
      );
      return;
    }
    this.logger.info(`[${room.friendlyName}] activate {${state.friendlyName}}`);
    await Promise.all([
      await each(state?.states, async state => {
        if (state.type !== 'entity') {
          return;
        }
        await this.commandRouter.process(
          state.ref,
          state.state,
          state.extra as Record<string, unknown>,
          waitForChange,
        );
      }),
      await each(state.states, async state => {
        if (state.type !== 'group') {
          return;
        }
        await this.groupService.activateState(
          { group: state.ref, state: state.state },
          waitForChange,
        );
      }),
    ]);
  }

  public async addEntity(
    room: RoomDTO | string,
    { entity_id }: RoomEntityDTO,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    if (!this.entityManager.ENTITIES.has(entity_id)) {
      this.logger.error(
        `[${room.friendlyName}] cannot attach {${entity_id}}. Entity does not exist`,
      );
      return;
    }
    this.logger.info(`[${room.friendlyName}] adding entity {${entity_id}}`);
    room.entities.push({ entity_id });
    return await this.roomPersistence.update(room, room._id);
  }

  public async addMetadata(room: RoomDTO | string): Promise<RoomDTO> {
    room = await this.load(room);
    room.metadata ??= [];
    room.metadata.push({
      id: uuid(),
      name: '',
      type: 'boolean',
      value: false,
    });
    return await this.roomPersistence.update(room, room._id);
  }

  public async addState(
    room: RoomDTO | string,
    state: RoomStateDTO,
  ): Promise<RoomStateDTO> {
    room = await this.load(room);
    state.id = uuid();
    room.save_states ??= [];
    room.save_states.push(state);
    this.logger.info(
      `[${room.friendlyName}] added state {${state.friendlyName ?? 'unnamed'}}`,
    );
    await this.roomPersistence.update(room, room._id);
    return state;
  }

  public async attachGroup(
    room: RoomDTO | string,
    group: GroupDTO | string,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    const attachGroup = await this.groupService.get(group);
    if (!group) {
      const id = is.string(group) ? group : group._id;
      this.logger.error(
        `[${room.friendlyName}] Cannot attach invalid group {${id}}`,
      );
      return;
    }
    this.logger.info(
      `[${room.friendlyName}] attach group [${attachGroup.friendlyName}]`,
    );
    room.groups.push(attachGroup._id);
    return await this.roomPersistence.update(room, room._id);
  }

  public async buildMetadata(): Promise<
    Record<string, Record<string, unknown>>
  > {
    const rooms = await this.list();
    return Object.fromEntries(
      rooms.map(room => [
        room.name ?? `room_${room._id}`,
        Object.fromEntries(
          (room.metadata ?? []).map(metadata => [
            metadata.name,
            metadata.type === 'date' && is.string(metadata.value)
              ? new Date(metadata.value as string)
              : metadata.value,
          ]),
        ),
      ]),
    );
  }

  public async clone(
    target: string,
    { name, omitStates, omitMetadata }: CloneRoomDTO,
  ): Promise<RoomDTO> {
    const source = await this.get(target);
    if (!source) {
      throw new NotFoundException();
    }
    return await this.create({
      entities: source.entities,
      friendlyName: name ?? `Copy of ${source.friendlyName}`,
      groups: source.groups,
      metadata: omitMetadata ? [] : source.metadata,
      save_states: omitStates ? [] : source.save_states,
      settings: source.settings,
      storage: source.storage,
    });
  }

  public async create(
    room: Omit<RoomDTO, keyof BaseSchemaDTO>,
  ): Promise<RoomDTO> {
    return await this.roomPersistence.create(room);
  }

  public async delete(item: RoomDTO | string): Promise<boolean> {
    const id = is.string(item) ? item : item._id;
    const room = await this.load(id);
    const routines = await this.routineService.list({
      filters: new Set([{ field: 'command.command.room', value: room._id }]),
    });
    if (!is.empty(routines)) {
      this.logger.info(
        `[${room.friendlyName}] removing deleted save state reference from {${routines.length}} routines`,
      );
    }
    await each(
      routines,
      async routine =>
        await this.routineService.update(routine._id, {
          command: routine.command.filter(
            (command: RoutineCommandDTO<RoutineCommandRoomStateDTO>) =>
              !(command.type === 'room_state' && command.command.room === id),
          ),
        }),
    );
    return await this.roomPersistence.delete(room);
  }

  public async deleteEntity(
    room: RoomDTO | string,
    entity: string,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.entities ??= [];
    room.entities = room.entities.filter(
      ({ entity_id }) => entity_id !== entity,
    );
    room.save_states ??= [];
    room.save_states = room.save_states.map(save_state => ({
      ...save_state,
      states: save_state.states.filter(
        ({ type, ref }) => type !== 'entity' || ref !== entity,
      ),
    }));
    return await this.roomPersistence.update(room, room._id);
  }

  public async deleteGroup(
    room: RoomDTO | string,
    groupId: string,
    stateOnly = false,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    if (!stateOnly) {
      room.groups ??= [];
      room.groups = room.groups.filter(group => group !== groupId);
    }
    room.save_states ??= [];
    room.save_states = room.save_states.map(save_state => ({
      ...save_state,
      states: save_state.states.filter(
        ({ type, ref }) => type !== 'group' || ref !== groupId,
      ),
    }));
    return await this.roomPersistence.update(room, room._id);
  }

  /**
   * Deliberate choice to not follow through and delete references
   */
  public async deleteMetadata(
    room: RoomDTO | string,
    remove: string,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.metadata ??= [];
    room.metadata = room.metadata.filter(({ id }) => id !== remove);
    return await this.roomPersistence.update(room, room._id);
  }

  public async deleteState(
    room: RoomDTO | string,
    state: string,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.save_states ??= [];
    room.save_states = room.save_states.filter(save => save.id !== state);
    const routines = await this.routineService.list({
      filters: new Set([{ field: 'command.command.room', value: room._id }]),
    });
    if (!is.empty(routines)) {
      this.logger.info(
        `[${room.friendlyName}] removing deleted save state reference from {${routines.length}} routines`,
      );
    }
    await each(
      routines,
      async routine =>
        await this.routineService.update(routine._id, {
          command: routine.command.filter(
            (command: RoutineCommandDTO<RoutineCommandRoomStateDTO>) =>
              !(
                command.type === 'room_state' && command.command.state === state
              ),
          ),
        }),
    );
    return await this.roomPersistence.update(room, room._id);
  }

  public async get(
    room: RoomDTO | string,
    withEntities = false,
    control: ResultControlDTO = {},
  ): Promise<RoomDTO> {
    room = await this.load(room, control);
    if (withEntities) {
      room.entityStates = room.entities.map(({ entity_id }) =>
        this.entityManager.getEntity(entity_id),
      );
    }
    return room;
  }

  public async list(control: ResultControlDTO = {}): Promise<RoomDTO[]> {
    return await this.roomPersistence.findMany(control);
  }

  public async update(
    room: Omit<Partial<RoomDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<RoomDTO> {
    return await this.roomPersistence.update(room, id);
  }

  public async updateMetadata(
    target: string | RoomDTO,
    id: string,
    update: Partial<RoomMetadataDTO>,
  ): Promise<RoomDTO> {
    const room = await this.load(target);
    room.metadata ??= [];
    const metadata = room.metadata.find(item => item.id === id);
    if (is.undefined(metadata)) {
      this.logger.error(`[${room.friendlyName}] cannot find metadata {${id}}`);
      return room;
    }
    if (!is.undefined(update.value)) {
      update.value = this.resolveValue(
        room.metadata.find(metadata => metadata.id === id),
        update.value,
      );
    }
    room.metadata = room.metadata.map(i =>
      i.id === id ? { ...i, ...update, id } : i,
    );
    const out = await this.update(room, room._id);
    update = room.metadata.find(item => item.id === id);
    this.eventEmitter.emit(ROOM_METADATA_UPDATED, {
      name: update.name,
      room: room._id,
      value: update.value,
    } as MetadataUpdate);
    return out;
  }

  public async updateState(
    room: string | RoomDTO,
    id: string,
    update: RoomStateDTO,
  ): Promise<RoomStateDTO> {
    room = await this.load(room);
    room.save_states ??= [];
    room.save_states = room.save_states.map(i =>
      i.id === id ? { ...i, ...update, id } : i,
    );
    await this.update(room, room._id);
    return room.save_states.find(state => state.id === id);
  }

  private async load(
    room: RoomDTO | string,
    control: ResultControlDTO = {},
  ): Promise<RoomDTO> {
    if (is.string(room)) {
      room = await this.roomPersistence.findById(room, { control });
    }
    if (!room) {
      throw new NotFoundException();
    }
    return room;
  }

  // eslint-disable-next-line radar/cognitive-complexity
  private resolveValue(
    metadata: RoomMetadataDTO,
    value: unknown,
  ): string | number | boolean | Date {
    switch (metadata.type) {
      case 'boolean':
        if (is.boolean(value)) {
          return value;
        }
        if (is.string(value)) {
          return ['true', 'y', 'checked'].includes(value.toLowerCase());
        }
        this.logger.error(
          { metadata, value },
          `Cannot coerce value to boolean`,
        );
        return false;
      case 'string':
        if (!is.string(value)) {
          this.logger.warn({ metadata, value }, `Value not provided as string`);
          return String(value);
        }
        return value;
      case 'date':
        if (is.date(value)) {
          return value;
        }
        if (is.string(value)) {
          if (isDateString(value)) {
            return new Date(value);
          }
          const [start] = this.chronoService.parse(value, false);
          if (is.date(start)) {
            return start;
          }
        }
        if (is.number(value)) {
          return new Date(value);
        }
        this.logger.error({ metadata, value }, `Cannot convert value to date`);
        return undefined;
      case 'number':
        if (is.number(value)) {
          return value;
        }
        if (is.string(value) && isNumberString(value)) {
          return Number(value);
        }
        this.logger.error(
          { metadata, value },
          `Cannot convert value to number`,
        );
        return undefined;
      case 'enum':
        if ((metadata.options ?? []).includes(value as string)) {
          return value as string;
        }
        this.logger.error({ metadata, value });
        return undefined;
    }
  }
}
