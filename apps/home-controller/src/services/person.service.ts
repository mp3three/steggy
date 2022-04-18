import { Injectable, NotFoundException } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  CloneRoomDTO,
  GroupDTO,
  PersonDTO,
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
import { v4 } from 'uuid';

import { MetadataUpdate, PERSON_METADATA_UPDATED } from '../typings';
import { GroupService } from './group.service';
import { MetadataService } from './metadata.service';
import { PersonPersistenceService } from './persistence';
import { RoutineService } from './routine.service';
import { SaveStateService } from './save-state.service';

@Injectable()
export class PersonService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly personPersistence: PersonPersistenceService,
    private readonly entityManager: EntityManagerService,
    private readonly groupService: GroupService,
    private readonly routineService: RoutineService,
    private readonly metadataService: MetadataService,
    private readonly saveStateService: SaveStateService,
    private readonly eventEmitter: EventEmitter,
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
    await this.saveStateService.activateState(state, waitForChange);
  }

  public async addEntity(
    room: PersonDTO | string,
    { entity_id }: RoomEntityDTO,
  ): Promise<PersonDTO> {
    room = await this.load(room);
    if (!this.entityManager.ENTITIES.has(entity_id)) {
      this.logger.error(
        `[${room.friendlyName}] cannot attach {${entity_id}}. Entity does not exist`,
      );
      return;
    }
    this.logger.info(`[${room.friendlyName}] adding entity {${entity_id}}`);
    room.entities.push({ entity_id });
    return await this.personPersistence.update(room, room._id);
  }

  public async addMetadata(room: PersonDTO | string): Promise<PersonDTO> {
    room = await this.load(room);
    room.metadata ??= [];
    room.metadata.push({
      id: v4(),
      name: '',
      type: 'boolean',
      value: false,
    });
    return await this.personPersistence.update(room, room._id);
  }

  public async addState(
    room: PersonDTO | string,
    state: RoomStateDTO,
  ): Promise<RoomStateDTO> {
    room = await this.load(room);
    state.id = v4();
    room.save_states ??= [];
    room.save_states.push(state);
    this.logger.info(
      `[${room.friendlyName}] added state {${state.friendlyName ?? 'unnamed'}}`,
    );
    await this.personPersistence.update(room, room._id);
    return state;
  }

  public async attachGroup(
    room: PersonDTO | string,
    group: GroupDTO | string,
  ): Promise<PersonDTO> {
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
    return await this.personPersistence.update(room, room._id);
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
  ): Promise<PersonDTO> {
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
    });
  }

  public async create(
    person: Omit<PersonDTO, keyof BaseSchemaDTO>,
  ): Promise<PersonDTO> {
    return await this.personPersistence.create(person);
  }

  public async delete(item: PersonDTO | string): Promise<boolean> {
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
    return await this.personPersistence.delete(room);
  }

  public async deleteEntity(
    room: PersonDTO | string,
    entity: string,
  ): Promise<PersonDTO> {
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
    return await this.personPersistence.update(room, room._id);
  }

  public async deleteGroup(
    room: PersonDTO | string,
    groupId: string,
    stateOnly = false,
  ): Promise<PersonDTO> {
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
    return await this.personPersistence.update(room, room._id);
  }

  /**
   * Deliberate choice to not follow through and delete references
   */
  public async deleteMetadata(
    room: PersonDTO | string,
    remove: string,
  ): Promise<PersonDTO> {
    room = await this.load(room);
    room.metadata ??= [];
    room.metadata = room.metadata.filter(({ id }) => id !== remove);
    return await this.personPersistence.update(room, room._id);
  }

  public async deleteState(
    room: PersonDTO | string,
    state: string,
  ): Promise<PersonDTO> {
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
    return await this.personPersistence.update(room, room._id);
  }

  public async get(
    room: PersonDTO | string,
    withEntities = false,
    control: ResultControlDTO = {},
  ): Promise<PersonDTO> {
    room = await this.load(room, control);
    if (withEntities) {
      room.entityStates = room.entities.map(({ entity_id }) =>
        this.entityManager.getEntity(entity_id),
      );
    }
    return room;
  }

  public async list(control: ResultControlDTO = {}): Promise<PersonDTO[]> {
    return await this.personPersistence.findMany(control);
  }

  public async update(
    room: Omit<Partial<PersonDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<PersonDTO> {
    return await this.personPersistence.update(room, id);
  }

  public async updateMetadata(
    target: string | PersonDTO,
    id: string,
    update: Partial<RoomMetadataDTO>,
  ): Promise<PersonDTO> {
    const room = await this.load(target);
    room.metadata ??= [];
    const metadata = room.metadata.find(item => item.id === id);
    if (is.undefined(metadata)) {
      this.logger.error(`[${room.friendlyName}] cannot find metadata {${id}}`);
      return room;
    }
    if (!is.undefined(update.value)) {
      update.value = this.metadataService.resolveValue(
        room.metadata.find(metadata => metadata.id === id),
        update.value,
      );
    }
    room.metadata = room.metadata.map(i =>
      i.id === id ? { ...i, ...update, id } : i,
    );
    const out = await this.update(room, room._id);
    update = room.metadata.find(item => item.id === id);
    this.eventEmitter.emit(PERSON_METADATA_UPDATED, {
      name: update.name,
      room: room._id,
      value: update.value,
    } as MetadataUpdate);
    return out;
  }

  public async updateState(
    room: string | PersonDTO,
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
    room: PersonDTO | string,
    control: ResultControlDTO = {},
  ): Promise<PersonDTO> {
    if (is.string(room)) {
      room = await this.personPersistence.findById(room, { control });
    }
    if (!room) {
      throw new NotFoundException();
    }
    return room;
  }
}
