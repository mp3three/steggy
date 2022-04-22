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
  PersonDTO,
  RoomDTO,
  RoomEntityDTO,
  RoomMetadataDTO,
  RoomStateDTO,
  RoutineCommandDTO,
  RoutineCommandPersonStateDTO,
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
import { RoomService } from './room.service';
import { RoutineService } from './routine.service';
import { SaveStateService } from './save-state.service';

@Injectable()
export class PersonService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly personPersistence: PersonPersistenceService,
    private readonly entityManager: EntityManagerService,
    @Inject(forwardRef(() => GroupService))
    private readonly groupService: GroupService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineService: RoutineService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    private readonly metadataService: MetadataService,
    private readonly saveStateService: SaveStateService,
    private readonly eventEmitter: EventEmitter,
  ) {}

  public async activateState(
    command: RoutineCommandPersonStateDTO,
    waitForChange = false,
  ): Promise<void> {
    const person = await this.load(command.person);
    const state = person.save_states.find(({ id }) => id === command.state);
    if (!state) {
      this.logger.error(
        `[${person.friendlyName}] Cannot find save state {${command.state}}`,
      );
      return;
    }
    this.logger.info(
      `[${person.friendlyName}] activate {${state.friendlyName}}`,
    );
    await this.saveStateService.activateState(state, waitForChange);
  }

  public async addEntity(
    person: PersonDTO | string,
    { entity_id }: RoomEntityDTO,
  ): Promise<PersonDTO> {
    person = await this.load(person);
    if (!this.entityManager.ENTITIES.has(entity_id)) {
      this.logger.error(
        `[${person.friendlyName}] cannot attach {${entity_id}}. Entity does not exist`,
      );
      return;
    }
    this.logger.info(`[${person.friendlyName}] adding entity {${entity_id}}`);
    person.entities.push({ entity_id });
    return await this.personPersistence.update(person, person._id);
  }

  public async addMetadata(person: PersonDTO | string): Promise<PersonDTO> {
    person = await this.load(person);
    person.metadata ??= [];
    person.metadata.push({
      id: v4(),
      name: '',
      type: 'boolean',
      value: false,
    });
    return await this.personPersistence.update(person, person._id);
  }

  public async addState(
    person: PersonDTO | string,
    state: RoomStateDTO,
  ): Promise<RoomStateDTO> {
    person = await this.load(person);
    state.id = v4();
    person.save_states ??= [];
    person.save_states.push(state);
    this.logger.info(
      `[${person.friendlyName}] added state {${
        state.friendlyName ?? 'unnamed'
      }}`,
    );
    await this.personPersistence.update(person, person._id);
    return state;
  }

  public async attachGroup(
    person: PersonDTO | string,
    group: GroupDTO | string,
  ): Promise<PersonDTO> {
    person = await this.load(person);
    const attachGroup = await this.groupService.get(group);
    if (!group) {
      const id = is.string(group) ? group : group._id;
      this.logger.error(
        `[${person.friendlyName}] Cannot attach invalid group {${id}}`,
      );
      return;
    }
    this.logger.info(
      `[${person.friendlyName}] attach group [${attachGroup.friendlyName}]`,
    );
    person.groups.push(attachGroup._id);
    return await this.personPersistence.update(person, person._id);
  }

  public async attachRoom(
    person: PersonDTO | string,
    room: RoomDTO | string,
  ): Promise<PersonDTO> {
    person = await this.load(person);
    const attachRoom = await this.roomService.get(room);
    if (!room) {
      const id = is.string(room) ? room : room._id;
      this.logger.error(
        `[${person.friendlyName}] Cannot attach invalid room {${id}}`,
      );
      return;
    }
    this.logger.info(
      `[${person.friendlyName}] attach room [${attachRoom.friendlyName}]`,
    );
    person.rooms.push(attachRoom._id);
    return await this.personPersistence.update(person, person._id);
  }

  public async buildMetadata(): Promise<
    Record<string, Record<string, unknown>>
  > {
    const people = await this.list();
    return Object.fromEntries(
      people.map(person => [
        person.name ?? `person${person._id}`,
        Object.fromEntries(
          (person.metadata ?? []).map(metadata => [
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
    const person = await this.load(id);
    const routines = await this.routineService.list({
      filters: new Set([{ field: 'command.command.room', value: person._id }]),
    });
    if (!is.empty(routines)) {
      this.logger.info(
        `[${person.friendlyName}] removing deleted save state reference from {${routines.length}} routines`,
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
    return await this.personPersistence.delete(person);
  }

  public async deleteEntity(
    person: PersonDTO | string,
    entity: string,
  ): Promise<PersonDTO> {
    person = await this.load(person);
    person.entities ??= [];
    person.entities = person.entities.filter(
      ({ entity_id }) => entity_id !== entity,
    );
    person.save_states ??= [];
    person.save_states = person.save_states.map(save_state => ({
      ...save_state,
      states: save_state.states.filter(
        ({ type, ref }) => type !== 'entity' || ref !== entity,
      ),
    }));
    return await this.personPersistence.update(person, person._id);
  }

  public async deleteGroup(
    person: PersonDTO | string,
    groupId: string,
    stateOnly = false,
  ): Promise<PersonDTO> {
    person = await this.load(person);
    if (!stateOnly) {
      person.groups ??= [];
      person.groups = person.groups.filter(group => group !== groupId);
    }
    person.save_states ??= [];
    person.save_states = person.save_states.map(save_state => ({
      ...save_state,
      states: save_state.states.filter(
        ({ type, ref }) => type !== 'group' || ref !== groupId,
      ),
    }));
    return await this.personPersistence.update(person, person._id);
  }

  /**
   * Deliberate choice to not follow through and delete references
   */
  public async deleteMetadata(
    person: PersonDTO | string,
    remove: string,
  ): Promise<PersonDTO> {
    person = await this.load(person);
    person.metadata ??= [];
    person.metadata = person.metadata.filter(({ id }) => id !== remove);
    return await this.personPersistence.update(person, person._id);
  }

  public async deleteRoom(
    person: PersonDTO | string,
    roomId: string,
    stateOnly = false,
  ): Promise<PersonDTO> {
    person = await this.load(person);
    if (!stateOnly) {
      person.rooms ??= [];
      person.rooms = person.rooms.filter(room => room !== roomId);
    }
    person.save_states ??= [];
    person.save_states = person.save_states.map(save_state => ({
      ...save_state,
      states: save_state.states.filter(
        ({ type, ref }) => type !== 'room' || ref !== roomId,
      ),
    }));
    return await this.personPersistence.update(person, person._id);
  }

  public async deleteState(
    person: PersonDTO | string,
    state: string,
  ): Promise<PersonDTO> {
    person = await this.load(person);
    person.save_states ??= [];
    person.save_states = person.save_states.filter(save => save.id !== state);
    const routines = await this.routineService.list({
      filters: new Set([{ field: 'command.command.room', value: person._id }]),
    });
    if (!is.empty(routines)) {
      this.logger.info(
        `[${person.friendlyName}] removing deleted save state reference from {${routines.length}} routines`,
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
    return await this.personPersistence.update(person, person._id);
  }

  public async get(
    person: PersonDTO | string,
    withEntities = false,
    control: ResultControlDTO = {},
  ): Promise<PersonDTO> {
    person = await this.load(person, control);
    if (withEntities) {
      person.entityStates = person.entities.map(({ entity_id }) =>
        this.entityManager.getEntity(entity_id),
      );
    }
    return person;
  }

  public async list(control: ResultControlDTO = {}): Promise<PersonDTO[]> {
    return await this.personPersistence.findMany(control);
  }

  public async update(
    person: Omit<Partial<PersonDTO>, keyof BaseSchemaDTO>,
    id: string,
  ): Promise<PersonDTO> {
    return await this.personPersistence.update(person, id);
  }

  public async updateMetadata(
    target: string | PersonDTO,
    id: string,
    update: Partial<RoomMetadataDTO>,
  ): Promise<PersonDTO> {
    const person = await this.load(target);
    person.metadata ??= [];
    const metadata = person.metadata.find(item => item.id === id);
    if (is.undefined(metadata)) {
      this.logger.error(
        `[${person.friendlyName}] cannot find metadata {${id}}`,
      );
      return person;
    }
    if (!is.undefined(update.value)) {
      update.value = this.metadataService.resolveValue(
        person.metadata.find(metadata => metadata.id === id),
        update.value,
      );
    }
    person.metadata = person.metadata.map(i =>
      i.id === id ? { ...i, ...update, id } : i,
    );
    const out = await this.update(person, person._id);
    update = person.metadata.find(item => item.id === id);
    this.eventEmitter.emit(PERSON_METADATA_UPDATED, {
      name: update.name,
      person: person._id,
      value: update.value,
    } as MetadataUpdate);
    return out;
  }

  public async updateState(
    person: string | PersonDTO,
    id: string,
    update: RoomStateDTO,
  ): Promise<RoomStateDTO> {
    person = await this.load(person);
    person.save_states ??= [];
    person.save_states = person.save_states.map(i =>
      i.id === id ? { ...i, ...update, id } : i,
    );
    await this.update(person, person._id);
    return person.save_states.find(state => state.id === id);
  }

  private async load(
    person: PersonDTO | string,
    control: ResultControlDTO = {},
  ): Promise<PersonDTO> {
    if (is.string(person)) {
      person = await this.personPersistence.findById(person, { control });
    }
    if (!person) {
      throw new NotFoundException();
    }
    return person;
  }
}
