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
import EventEmitter from 'eventemitter3';
import { v4 as uuid } from 'uuid';

import { MetadataUpdate, ROOM_METADATA_UPDATED } from '../typings';
import { GroupService } from './group.service';
import { MetadataService } from './metadata.service';
import { RoomPersistenceService } from './persistence';
import { RoutineService } from './routine.service';
import { SaveStateService } from './save-state.service';

@Injectable()
export class RoomService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly roomPersistence: RoomPersistenceService,
    private readonly routineService: RoutineService,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
    private readonly entityManager: EntityManagerService,
    private readonly eventEmitter: EventEmitter,
    private readonly metadataService: MetadataService,
    private readonly saveState: SaveStateService,
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
    await this.saveState.activateState(state, waitForChange);
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
    const attachGroup = await this.groupService.load(group);
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
    const source = await this.load(target);
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

  public async getWithStates(
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

  public async load(
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

  public async update(
    room: Omit<Partial<RoomDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<RoomDTO> {
    const loaded = await this.load(id);
    if (!loaded) {
      throw new NotFoundException(id);
    }
    if (room.groups || room.entities) {
      room.save_states = room.save_states ?? loaded.save_states;
      room.entities = room.entities ?? loaded.entities;
      room.groups = room.groups ?? loaded.groups;
      room.save_states = room.save_states.map(state => {
        state.states = state.states.filter(item => {
          if (item.type === 'entity') {
            return room.entities.some(
              ({ entity_id }) => entity_id === item.ref,
            );
          }
          if (item.type === 'group') {
            return room.groups.includes(item.ref);
          }
          return false;
        });
        return state;
      });
    }
    return await this.roomPersistence.update(room, id);
  }

  public async updateMetadata(
    target: string | RoomDTO,
    id: string,
    update: Partial<RoomMetadataDTO>,
  ): Promise<RoomDTO> {
    const room = await this.load(target);
    room.metadata ??= [];
    const metadata = room.metadata.find(item =>
      [item.id, item.name].includes(id),
    );
    if (is.undefined(metadata)) {
      this.logger.error(`[${room.friendlyName}] cannot find metadata {${id}}`);
      return room;
    }
    if (!is.undefined(update.value)) {
      update.value = this.metadataService.resolveValue(
        room.metadata.find(item => [item.id, item.name].includes(id)),
        update.value,
      );
    }
    room.metadata = room.metadata.map(i =>
      i.id === id ? { ...i, ...update, id } : i,
    );
    const out = await this.update(room, room._id);
    update = room.metadata.find(item => [item.id, item.name].includes(id));
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
}
