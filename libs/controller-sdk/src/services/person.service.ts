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
  InflatedPinDTO,
  PersonDTO,
  PIN_TYPES,
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
import { each, is, ResultControlDTO, START } from '@steggy/utilities';
import { eachLimit } from 'async';
import EventEmitter from 'eventemitter3';
import { v4 } from 'uuid';

import { MetadataUpdate, PERSON_METADATA_UPDATED } from '../typings';
import { GroupService } from './group.service';
import { MetadataService } from './metadata.service';
import { PersonPersistenceService } from './persistence';
import { RoomService } from './room.service';
import { RoutineService } from './routine.service';
import { SaveStateService } from './save-state.service';

const A_BUNCH = 20;
const SAVESTATE_ID = 'save_states.id';

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
    @Inject(forwardRef(() => MetadataService))
    private readonly metadataService: MetadataService,
    private readonly saveStateService: SaveStateService,
    private readonly eventEmitter: EventEmitter,
  ) {}

  public async activateState(
    command: RoutineCommandPersonStateDTO,
    waitForChange = false,
  ): Promise<void> {
    const person = await this.load(command.person);
    if (!person) {
      throw new NotFoundException();
    }
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
    if (!person) {
      throw new NotFoundException();
    }
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
    if (!person) {
      throw new NotFoundException();
    }
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
    if (!person) {
      throw new NotFoundException();
    }
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
    if (!person) {
      throw new NotFoundException();
    }
    const attachGroup = await this.groupService.load(group);
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
    if (!person) {
      throw new NotFoundException();
    }
    const attachRoom = await this.roomService.load(room);
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
    if (!person) {
      // I guess it's deleted?
      return true;
    }
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
    if (!person) {
      throw new NotFoundException();
    }
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
    if (!person) {
      throw new NotFoundException();
    }
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
    if (!person) {
      throw new NotFoundException();
    }
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
    if (!person) {
      throw new NotFoundException();
    }
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
    if (!person) {
      throw new NotFoundException();
    }
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

  public async getWithStates(
    person: PersonDTO | string,
    withEntities = false,
    control: ResultControlDTO = {},
  ): Promise<PersonDTO> {
    person = await this.load(person, control);
    if (!person) {
      throw new NotFoundException();
    }
    if (withEntities) {
      person.entityStates = person.entities.map(({ entity_id }) =>
        this.entityManager.getEntity(entity_id),
      );
    }
    return person;
  }

  // I don't feel like it
  // eslint-disable-next-line radar/cognitive-complexity
  public async inflatePins(id: string): Promise<InflatedPinDTO[]> {
    const person = await this.load(id);
    if (!person) {
      throw new NotFoundException();
    }
    const out: InflatedPinDTO[] = [];
    await eachLimit(person.pinned_items, A_BUNCH, async pin => {
      switch (pin.type) {
        case 'person_metadata':
          const people = await this.list({
            filters: new Set([{ field: 'metadata.id', value: pin.target }]),
          });
          if (is.empty(people)) {
            this.logger.error(`Cannot find metadata {${pin.target}}`);
            return;
          }
          const metaPerson = people[START];
          const metaPersonProperty = metaPerson.metadata.find(
            ({ id }) => id === pin.target,
          );
          out.push({
            description: metaPersonProperty.description,
            friendlyName: [metaPerson.friendlyName, metaPersonProperty.name],
            id: pin.target,
            type: pin.type,
          });
          return;
        case 'room_metadata':
          const rooms = await this.roomService.list({
            filters: new Set([{ field: 'metadata.id', value: pin.target }]),
          });
          if (is.empty(rooms)) {
            this.logger.error(`Cannot find metadata {${pin.target}}`);
            return;
          }
          const metaRoom = rooms[START];
          const metaRoomProperty = metaRoom.metadata.find(
            ({ id }) => id === pin.target,
          );
          out.push({
            description: metaRoomProperty.description,
            friendlyName: [metaRoom.friendlyName, metaRoomProperty.name],
            id: pin.target,
            type: pin.type,
          });
          return;
        case 'person':
          const person = await this.load(pin.target);
          if (!person) {
            this.logger.error(`Cannot find person {${pin.target}}`);
            return;
          }
          out.push({
            friendlyName: [person.friendlyName],
            id: pin.target,
            type: pin.type,
          });
          return;
        case 'person_state':
          const [foundPerson] = await this.list({
            filters: new Set([{ field: SAVESTATE_ID, value: pin.target }]),
          });
          if (!foundPerson) {
            this.logger.error(`Cannot find person_state {${pin.target}}`);
            return;
          }
          out.push({
            friendlyName: [
              foundPerson.friendlyName,
              foundPerson.save_states.find(({ id }) => id === pin.target)
                .friendlyName,
            ],
            id: pin.target,
            type: pin.type,
          });
          return;
        case 'entity':
          const entity = this.entityManager.ENTITIES.get(pin.target);
          if (!entity) {
            this.logger.error(`[${pin.target}] is pinned, but cannot be found`);
            return;
          }
          out.push({
            friendlyName: [entity?.attributes?.friendly_name ?? pin.target],
            id: pin.target,
            type: pin.type,
          });
          return;
        case 'group':
          const group = await this.groupService.load(pin.target);
          if (!group) {
            this.logger.error(`Cannot find group {${pin.target}}`);
            return;
          }
          out.push({
            friendlyName: [group.friendlyName],
            id: pin.target,
            type: pin.type,
          });
          return;
        case 'group_state':
          const [foundGroup] = await this.groupService.list({
            filters: new Set([{ field: SAVESTATE_ID, value: pin.target }]),
          });
          if (!foundGroup) {
            this.logger.error(`Cannot find group_state {${pin.target}}`);
            return;
          }
          out.push({
            friendlyName: [
              foundGroup.friendlyName,
              foundGroup.save_states.find(({ id }) => id === pin.target)
                .friendlyName,
            ],
            id: pin.target,
            type: pin.type,
          });
          return;
        case 'room':
          const room = await this.roomService.load(pin.target);
          if (!room) {
            this.logger.error(`Cannot find room {${pin.target}}`);
            return;
          }
          out.push({
            friendlyName: [room.friendlyName],
            id: pin.target,
            type: pin.type,
          });
          return;
        case 'room_state':
          const [foundRoom] = await this.roomService.list({
            filters: new Set([{ field: SAVESTATE_ID, value: pin.target }]),
          });
          if (!foundRoom) {
            this.logger.error(`Cannot find room_state {${pin.target}}`);
            return;
          }
          out.push({
            friendlyName: [
              foundRoom.friendlyName,
              foundRoom.save_states.find(({ id }) => id === pin.target)
                .friendlyName,
            ],
            id: pin.target,
            type: pin.type,
          });
          return;
        case 'routine':
          const routine = await this.routineService.get(pin.target);
          out.push({
            description: routine.description,
            extraContext: this.routineService.superFriendlyName(pin.target),
            friendlyName: [routine.friendlyName],
            id: pin.target,
            type: pin.type,
          });
          return;
      }
    });
    return out;
  }

  public async itemPin(
    person: string | PersonDTO,
    type: PIN_TYPES,
    target: string,
  ): Promise<PersonDTO> {
    person = await this.load(person);
    if (!person) {
      throw new NotFoundException();
    }
    person.pinned_items ??= [];
    person.pinned_items.push({ target, type });
    return await this.update(person, person._id);
  }

  public async itemUnpin(
    person: string | PersonDTO,
    type: string,
    target: string,
  ): Promise<PersonDTO> {
    person = await this.load(person);
    if (!person) {
      throw new NotFoundException();
    }
    person.pinned_items ??= [];
    person.pinned_items = person.pinned_items.filter(
      item => !(item.target === target && item.type === type),
    );
    return await this.update(person, person._id);
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
    if (!person) {
      throw new NotFoundException();
    }
    person.metadata ??= [];
    const metadata = person.metadata.find(item =>
      [item.id, item.name].includes(id),
    );
    if (is.undefined(metadata)) {
      this.logger.error(
        `[${person.friendlyName}] cannot find metadata {${id}}`,
      );
      return person;
    }
    if (!is.undefined(update.value)) {
      update.value = this.metadataService.resolveValue(
        person.metadata.find(item => [item.id, item.name].includes(id)),
        update.value,
      );
    }
    person.metadata = person.metadata.map(i =>
      i.id === id ? { ...i, ...update, id } : i,
    );
    const out = await this.update(person, person._id);
    update = person.metadata.find(item => [item.id, item.name].includes(id));
    this.eventEmitter.emit(PERSON_METADATA_UPDATED, {
      name: update.name,
      room: person._id,
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
    if (!person) {
      throw new NotFoundException();
    }
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
