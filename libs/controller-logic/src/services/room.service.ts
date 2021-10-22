import { domain, HASS_DOMAINS } from '@automagical/home-assistant';
import { BaseSchemaDTO } from '@automagical/persistence';
import {
  AutoLogService,
  ResultControlDTO,
  Trace,
} from '@automagical/utilities';
import { Injectable, NotFoundException } from '@nestjs/common';
import { each } from 'async';
import { v4 as uuid } from 'uuid';

import {
  GroupDTO,
  KunamiSensor,
  ROOM_ENTITY_TYPES,
  RoomDTO,
  RoomEntityDTO,
  RoomSensorDTO,
  SaveStateDTO,
} from '../contracts';
import { EntityCommandRouterService } from './entity-command-router.service';
import { GroupService } from './groups';
import { LightManagerService } from './light-manager.service';
import {
  RoomPersistenceService,
  SaveStatePersistenceService,
} from './persistence';

const EXPECTED_REMOVE_AMOUNT = 1;

@Injectable()
export class RoomService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly roomPersistence: RoomPersistenceService,
    private readonly groupService: GroupService,
    private readonly lightManager: LightManagerService,
    private readonly commandRouter: EntityCommandRouterService,
    private readonly statePersistence: SaveStatePersistenceService,
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
  public async addSensor(
    room: RoomDTO | string,
    sensor: KunamiSensor,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    sensor.id = uuid();
    room.sensors ??= [];
    room.sensors.push(sensor);
    return await this.roomPersistence.update(room, room._id);
  }

  @Trace()
  public async addState(
    room: RoomDTO | string,
    state: SaveStateDTO,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    state = BaseSchemaDTO.cleanup(state);
    state = await this.statePersistence.create(state);
    room.save_states ??= [];
    room.save_states.push(state._id);
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
  public async captureState(
    room: RoomDTO | string,
    name: string,
  ): Promise<RoomDTO> {
    room = await this.get(room);
    room.save_states.push({
      entities: [],
      groups: [],
      id: uuid(),
      name,
    });
    await this.roomPersistence.update(room, room._id);
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
  public async deleteSaveState(
    room: RoomDTO | string,
    stateId: string,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.save_states ??= [];
    const startSize = room.save_states.length;
    room.save_states = room.save_states.filter((item) => item.id !== stateId);
    const endSize = startSize - EXPECTED_REMOVE_AMOUNT;
    if (room.save_states.length !== endSize) {
      // Gonna save anyways though
      // Ths probably means it was a bad match or something....
      // Not sure if there is a good way to delete more than 1 without things being already super wrong
      this.logger.warn(
        { actual: room.save_states.length, expected: endSize },
        `Unexpected removal amount`,
      );
    }
    return await this.roomPersistence.update(room, room._id);
  }

  @Trace()
  public async deleteSensor(
    room: RoomDTO | string,
    sensorId: string,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.sensors ??= [];
    const startSize = room.sensors.length;
    room.sensors = room.sensors.filter((item) => item.id !== sensorId);
    const endSize = startSize - EXPECTED_REMOVE_AMOUNT;
    if (room.sensors.length !== endSize) {
      // Gonna save anyways though
      // Ths probably means it was a bad match or something....
      // Not sure if there is a good way to delete more than 1 without things being already super wrong
      this.logger.warn(
        { actual: room.sensors.length, expected: endSize },
        `Unexpected removal amount`,
      );
    }
    return await this.roomPersistence.update(room, room._id);
  }

  @Trace()
  public async dimDown(
    room: RoomDTO | string,
    scope: ROOM_ENTITY_TYPES | ROOM_ENTITY_TYPES[] = ROOM_ENTITY_TYPES.normal,
  ): Promise<void> {
    room = await this.load(room);
    scope = Array.isArray(scope) ? scope : [scope];
    await Promise.all([
      await each(room.entities ?? [], async (entity, callback) => {
        if (scope.includes(entity.type)) {
          await this.commandRouter.process(entity.entity_id, 'dimDown');
        }
        callback();
      }),
      await each(room.groups ?? [], async (group, callback) => {
        await this.groupService.activateState(group, 'dimDown');
        callback();
      }),
    ]);
  }

  @Trace()
  public async dimUp(
    room: RoomDTO | string,
    scope: ROOM_ENTITY_TYPES | ROOM_ENTITY_TYPES[] = ROOM_ENTITY_TYPES.normal,
  ): Promise<void> {
    room = await this.load(room);
    scope = Array.isArray(scope) ? scope : [scope];
    await Promise.all([
      await each(room.entities ?? [], async (entity, callback) => {
        if (scope.includes(entity.type)) {
          await this.commandRouter.process(entity.entity_id, 'dimUp');
        }
        callback();
      }),
      await each(room.groups ?? [], async (group, callback) => {
        await this.groupService.activateState(group, 'dimUp');
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
  public async turnOff(
    room: RoomDTO | string,
    scope: ROOM_ENTITY_TYPES | ROOM_ENTITY_TYPES[] = ROOM_ENTITY_TYPES.normal,
  ): Promise<void> {
    room = await this.load(room);
    scope = Array.isArray(scope) ? scope : [scope];
    await Promise.all([
      await each(room.entities ?? [], async (entity, callback) => {
        if (scope.includes(entity.type)) {
          await this.commandRouter.process(entity.entity_id, 'turnOff');
        }
        callback();
      }),
      await each(room.groups ?? [], async (group, callback) => {
        await this.groupService.turnOff(group);
        callback();
      }),
    ]);
  }

  @Trace()
  public async turnOn(
    room: RoomDTO | string,
    scope: ROOM_ENTITY_TYPES | ROOM_ENTITY_TYPES[] = ROOM_ENTITY_TYPES.normal,
    circadian = false,
  ): Promise<void> {
    room = await this.load(room);
    scope = Array.isArray(scope) ? scope : [scope];
    await Promise.all([
      await each(room.entities ?? [], async (entity, callback) => {
        if (scope.includes(entity.type)) {
          if (domain(entity.type) === HASS_DOMAINS.light && circadian) {
            await this.lightManager.circadianLight(entity.entity_id);
            return callback();
          }
          await this.commandRouter.process(entity.entity_id, 'turnOn');
        }
        callback();
      }),
      await each(room.groups ?? [], async (group, callback) => {
        await this.groupService.turnOn(group);
        callback();
      }),
    ]);
  }

  @Trace()
  public async update(
    room: Omit<Partial<RoomDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<RoomDTO> {
    return await this.roomPersistence.update(room, id);
  }

  @Trace()
  public async updateSensor(
    room: RoomDTO | string,
    state: RoomSensorDTO,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.sensors ??= [];
    room.sensors = room.sensors.map((saved) =>
      saved.id === state.id ? state : saved,
    );
    return await this.roomPersistence.update(room, room._id);
  }

  @Trace()
  public async updateState(
    room: RoomDTO | string,
    state: RoomSaveStateDTO,
  ): Promise<RoomDTO> {
    room = await this.load(room);
    room.save_states ??= [];
    room.save_states = room.save_states.map((saved) =>
      saved.id === state.id ? state : saved,
    );
    return await this.roomPersistence.update(room, room._id);
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
