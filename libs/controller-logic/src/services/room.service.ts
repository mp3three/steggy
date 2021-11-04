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

import {
  EntityFilters,
  GroupDTO,
  RoomDTO,
  RoomEntityDTO,
  RoutineCommandRoomStateDTO,
} from '../contracts';
import { EntityCommandRouterService } from './entity-command-router.service';
import { GroupService } from './groups';
import { LightManagerService } from './light-manager.service';
import { RoomPersistenceService } from './persistence';

@Injectable()
export class RoomService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly roomPersistence: RoomPersistenceService,
    private readonly groupService: GroupService,
    private readonly lightManager: LightManagerService,
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
    await each(state.states, async (state, callback) => {
      await this.commandRouter.process(
        state.ref,
        state.state,
        state.extra as Record<string, unknown>,
      );
      callback();
    });
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
  public async dimDown(
    room: RoomDTO | string,
    filters: EntityFilters = {},
  ): Promise<void> {
    room = await this.load(room);
    const entities = this.filterEntities(room, filters);
    await Promise.all([
      await each(entities, async (entity, callback) => {
        await this.commandRouter.process(entity.entity_id, 'dimDown');
        callback();
      }),
      await each(room.groups ?? [], async (group, callback) => {
        await this.groupService.activateCommand({
          command: 'dimDown',
          group,
        });
        callback();
      }),
    ]);
  }

  @Trace()
  public async dimUp(
    room: RoomDTO | string,
    filters: EntityFilters = {},
  ): Promise<void> {
    room = await this.load(room);
    const entities = this.filterEntities(room, filters);
    await Promise.all([
      await each(entities, async (entity, callback) => {
        await this.commandRouter.process(entity.entity_id, 'dimUp');
        callback();
      }),
      await each(room.groups ?? [], async (group, callback) => {
        await this.groupService.activateCommand({
          command: 'dimUp',
          group,
        });
        callback();
      }),
    ]);
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
