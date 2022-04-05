import { AutoLogService } from '@automagical/boilerplate';
import {
  GroupDTO,
  RoomDTO,
  RoomEntityDTO,
  RoomMetadataDTO,
  RoomStateDTO,
  RoutineCommandRoomStateDTO,
} from '@automagical/controller-shared';
import { EntityManagerService } from '@automagical/home-assistant';
import { BaseSchemaDTO } from '@automagical/persistence';
import { each, is, ResultControlDTO } from '@automagical/utilities';
import { Injectable, NotFoundException } from '@nestjs/common';
import EventEmitter from 'eventemitter3';
import { v4 as uuid } from 'uuid';

import { MetadataUpdate, ROOM_METADATA_UPDATED } from '../typings';
import { EntityCommandRouterService } from './entity-command-router.service';
import { GroupService } from './groups';
import { RoomPersistenceService } from './persistence';

@Injectable()
export class RoomService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly roomPersistence: RoomPersistenceService,
    private readonly groupService: GroupService,
    private readonly commandRouter: EntityCommandRouterService,
    private readonly entityManager: EntityManagerService,
    private readonly eventEmitter: EventEmitter,
  ) {}

  public async activateState(
    command: RoutineCommandRoomStateDTO,
    waitForChange = false,
  ): Promise<void> {
    const room = await this.load(command.room);
    const state = room.save_states.find(({ id }) => id === command.state);
    if (!state) {
      throw new NotFoundException(`Cannot find save state ${command.state}`);
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
          {
            group: state.ref,
            state: state.state,
          },
          waitForChange,
        );
      }),
    ]);
  }

  public async addEntity(
    room: RoomDTO | string,
    entity: RoomEntityDTO,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.entities.push(entity);
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
    await this.roomPersistence.update(room, room._id);
    return state;
  }

  public async attachGroup(
    room: RoomDTO | string,
    group: GroupDTO | string,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    group = await this.groupService.get(group);
    room.groups.push(group._id);
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

  public async create(
    room: Omit<RoomDTO, keyof BaseSchemaDTO>,
  ): Promise<RoomDTO> {
    return await this.roomPersistence.create(room);
  }

  public async delete(room: RoomDTO | string): Promise<boolean> {
    room = is.string(room) ? room : room._id;
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
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.groups ??= [];
    room.groups = room.groups.filter(group => group !== groupId);
    room.save_states ??= [];
    room.save_states = room.save_states.map(save_state => ({
      ...save_state,
      states: save_state.states.filter(
        ({ type, ref }) => type !== 'group' || ref !== groupId,
      ),
    }));
    return await this.roomPersistence.update(room, room._id);
  }

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
    room: string | RoomDTO,
    id: string,
    update: Partial<RoomMetadataDTO>,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.metadata ??= [];
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
      i.id === id ? { ...update, id } : i,
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
}
