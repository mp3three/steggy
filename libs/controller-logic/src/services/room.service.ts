import { domain } from '@automagical/home-assistant';
import { BaseSchemaDTO } from '@automagical/persistence';
import {
  AutoLogService,
  IsEmpty,
  ResultControlDTO,
  Trace,
} from '@automagical/utilities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { each } from 'async';
import { v4 as uuid } from 'uuid';

import {
  EntityFilters,
  GroupDTO,
  RoomDTO,
  RoomEntityDTO,
  RoomStateDTO,
  RoutineCommandRoomStateDTO,
} from '../contracts';
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
  ) {}

  @Trace()
  public async activateState(
    command: RoutineCommandRoomStateDTO,
  ): Promise<void> {
    const room = await this.load(command.room);
    const state = room.save_states.find(({ id }) => id === command.state);
    if (!state) {
      throw new NotFoundException(`Cannot find save state ${command.state}`);
    }
    this.logger.info(`[${room.friendlyName}] activate {${state.friendlyName}}`);
    await Promise.all([
      await each(state.states, async (state, callback) => {
        if (state.type !== 'entity') {
          callback();
          return;
        }
        await this.commandRouter.process(
          state.ref,
          state.state,
          state.extra as Record<string, unknown>,
        );
        callback();
      }),
      await each(state.states, async (state, callback) => {
        if (state.type !== 'group') {
          callback();
          return;
        }
        await this.groupService.activateState({
          group: state.ref,
          state: state.state,
        });
        callback();
      }),
    ]);
  }

  @Trace()
  public async addEntity(
    room: RoomDTO | string,
    entity: RoomEntityDTO,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.entities.push(entity);
    return await this.roomPersistence.update(room, room._id);
  }

  @Trace()
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

  @Trace()
  public async attachGroup(
    room: RoomDTO | string,
    group: GroupDTO | string,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    group = await this.groupService.get(group);
    room.groups.push(group._id);
    return await this.roomPersistence.update(room, room._id);
  }
  @Trace()
  public async create(
    room: Omit<RoomDTO, keyof BaseSchemaDTO>,
  ): Promise<RoomDTO> {
    return await this.roomPersistence.create(room);
  }

  @Trace()
  public async delete(room: RoomDTO | string): Promise<boolean> {
    room = typeof room === 'string' ? room : room._id;
    return await this.roomPersistence.delete(room);
  }

  @Trace()
  public async deleteEntity(
    room: RoomDTO | string,
    entity: string,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.entities ??= [];
    room.entities = room.entities.filter(
      ({ entity_id }) => entity_id !== entity,
    );
    return await this.roomPersistence.update(room, room._id);
  }

  @Trace()
  public async deleteGroup(
    room: RoomDTO | string,
    groupId: string,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.groups ??= [];
    room.groups = room.groups.filter((group) => group !== groupId);
    return await this.roomPersistence.update(room, room._id);
  }

  @Trace()
  public async deleteState(
    room: RoomDTO | string,
    state: string,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.save_states ??= [];
    room.save_states = room.save_states.filter((save) => save.id !== state);
    return await this.roomPersistence.update(room, room._id);
  }

  @Trace()
  public async get(room: RoomDTO | string): Promise<RoomDTO> {
    return await this.load(room);
  }

  @Trace()
  public async list(control: ResultControlDTO = {}): Promise<RoomDTO[]> {
    return await this.roomPersistence.findMany(control);
  }

  @Trace()
  public async update(
    room: Omit<Partial<RoomDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<RoomDTO> {
    return await this.roomPersistence.update(room, id);
  }

  @Trace()
  public async updateState(
    room: string | RoomDTO,
    id: string,
    update: RoomStateDTO,
  ): Promise<RoomStateDTO> {
    room = await this.load(room);
    room.save_states ??= [];
    room.save_states = room.save_states.map((i) =>
      i.id === id ? { ...update, id } : i,
    );
    await this.update(room, room._id);
    return room.save_states.find((state) => state.id === id);
  }

  @Trace()
  private filterEntities(
    { entities }: RoomDTO,
    filters: EntityFilters,
  ): RoomEntityDTO[] {
    if (!IsEmpty(filters.tags)) {
      entities = entities.filter(({ tags }) =>
        tags.some((tag) => {
          return tags.includes(tag);
        }),
      );
    }
    if (!IsEmpty(filters.domains)) {
      entities = entities.filter(({ entity_id }) =>
        filters.domains.includes(domain(entity_id)),
      );
    }
    return entities;
  }

  @Trace()
  private async load(room: RoomDTO | string): Promise<RoomDTO> {
    if (typeof room === 'string') {
      room = await this.roomPersistence.findById(room);
    }
    if (!room) {
      throw new NotFoundException();
    }
    return room;
  }
}
