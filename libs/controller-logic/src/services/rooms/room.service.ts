import { LightManagerService } from '@automagical/controller-logic';
import {
  domain,
  EntityManagerService,
  FanStateDTO,
  HASS_DOMAINS,
  LightStateDTO,
  MediaPlayerStateDTO,
  SwitchStateDTO,
} from '@automagical/home-assistant';
import { BaseSchemaDTO } from '@automagical/persistence';
import {
  AutoLogService,
  ResultControlDTO,
  Trace,
} from '@automagical/utilities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { each } from 'async';

import {
  BASIC_STATE,
  GroupDTO,
  ROOM_ENTITY_TYPES,
  RoomDTO,
  RoomEntityDTO,
  RoomEntitySaveStateDTO,
} from '../../contracts';
import { GroupService } from '../groups';
import { RoomPersistenceService } from '../persistence';

@Injectable()
export class RoomService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly roomPersistence: RoomPersistenceService,
    private readonly groupService: GroupService,
    private readonly entityManager: EntityManagerService,
    private readonly lightManager: LightManagerService,
  ) {}

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
    room.groups.push(group.name);
    return await this.roomPersistence.update(room, room._id);
  }

  @Trace()
  public async captureState(room: RoomDTO | string): Promise<RoomDTO> {
    room = await this.load(room);
    room.state = {
      entities: await this.entityStates(room),
    };
    return room;
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
  public async get(room: RoomDTO | string): Promise<RoomDTO> {
    room = await this.load(room);
    return room;
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
  private async entityStates(room: RoomDTO): Promise<RoomEntitySaveStateDTO[]> {
    room.entities ??= [];
    const states: RoomEntitySaveStateDTO[] = [];
    await each(room.entities, async ({ entity_id }, callback) => {
      const [entity] = this.entityManager.getEntity([entity_id]);
      if (!entity) {
        this.logger.warn(
          `Cannot find entity {${entity_id}}. Omitting from state`,
        );
        return callback();
      }
      switch (domain(entity_id)) {
        case HASS_DOMAINS.switch:
          states.push({
            id: entity_id,
            state: (entity as SwitchStateDTO).state,
          });
          return callback();

        case HASS_DOMAINS.light:
          states.push({
            extra: await this.lightManager.getState(entity_id),
            id: entity_id,
            state: (entity as LightStateDTO).state,
          });
          return callback();

        case HASS_DOMAINS.fan:
          states.push({
            extra: {
              speed: (entity as FanStateDTO).attributes.speed,
            },
            id: entity_id,
            state: (entity as FanStateDTO).state,
          });
          return callback();

        case HASS_DOMAINS.media_player:
          states.push({
            id: entity_id,
            state: (entity as MediaPlayerStateDTO).state,
          });
          return callback();
      }
      this.logger.error(
        { entity_id },
        `Domain {${domain(entity_id)}} not implemented`,
      );
      callback();
    });
    return states;
  }

  @Trace()
  private async groupStates(
    room: RoomDTO,
  ): Promise<Record<string, BASIC_STATE[]>> {
    room.groups ??= [];
    const states: Record<string, BASIC_STATE[]> = {};
    await each(room.groups, async (id, callback) => {
      const group = await this.groupService.get(id);
      states[id] = group.state;
      callback();
    });
    return states;
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
