import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  NotImplementedException,
} from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import type {
  CloneGroupDTO,
  GroupSaveStateDTO,
  ROOM_ENTITY_EXTRAS,
  RoutineCommandDTO,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
} from '@steggy/controller-shared';
import { GROUP_TYPES, GroupDTO } from '@steggy/controller-shared';
import { domain } from '@steggy/home-assistant-shared';
import { BaseSchemaDTO } from '@steggy/persistence';
import { each, is, ResultControlDTO } from '@steggy/utilities';
import { v4 } from 'uuid';

import { EntityCommandRouterService } from './entities/entity-command-router.service';
import {
  GroupGroupService,
  PersonGroupService,
  RoomGroupService,
} from './groups';
import { BaseGroupService } from './groups/base-group.service';
import { FanGroupService } from './groups/fan-group.service';
import { LightGroupService } from './groups/light-group.service';
import { LockGroupService } from './groups/lock-group.service';
import { SwitchGroupService } from './groups/switch-group.service';
import { LightManagerService } from './lighting';
import { GroupPersistenceService } from './persistence';
import { RoomService } from './room.service';
import { RoutineService } from './routine.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly commandRouter: EntityCommandRouterService,
    private readonly fanGroup: FanGroupService,
    private readonly groupPersistence: GroupPersistenceService,
    private readonly lightGroup: LightGroupService,
    private readonly lightManager: LightManagerService,
    private readonly lockGroup: LockGroupService,
    private readonly groupGroup: GroupGroupService, // i am group
    private readonly roomGroup: RoomGroupService,
    private readonly peopleGroup: PersonGroupService,
    private readonly logger: AutoLogService,
    private readonly switchGroup: SwitchGroupService,
    @Inject(forwardRef(() => RoomService))
    private readonly roomService: RoomService,
    private readonly routineService: RoutineService,
  ) {}

  public async activateCommand(
    command: RoutineCommandGroupActionDTO,
    waitForChange = false,
  ): Promise<void> {
    const group = await this.load(command.group);
    const base = this.getBaseGroup(group.type);
    return await base.activateCommand(group, command, waitForChange);
  }

  public async activateState(
    command: RoutineCommandGroupStateDTO,
    waitForChange = false,
  ): Promise<void> {
    const group = await this.load(command.group);
    if (!group) {
      this.logger.error({ command }, `Cannot find group {${command.group}}`);
      return;
    }
    const base = this.getBaseGroup(group.type);
    return await base.activateState(group, command.state, waitForChange);
  }

  public async addEntity<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    group: GroupDTO | string,
    entity: string | string[],
  ): Promise<GroupDTO<GROUP_TYPE>> {
    entity = is.string(entity) ? [entity] : entity;
    group = await this.load(group);
    if (!group) {
      throw new NotFoundException();
    }
    group.entities = [
      ...group.entities.filter(id => !entity.includes(id)),
      ...entity,
    ];
    return this.update(group._id, group);
  }

  public async addState<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    group: GroupDTO<GROUP_TYPE> | string,
    state: GroupSaveStateDTO<GROUP_TYPE>,
  ): Promise<GroupDTO<GROUP_TYPE>> {
    group = await this.load(group);
    if (!group) {
      throw new NotFoundException();
    }
    const base = this.getBaseGroup(group.type);
    return await base.addState(group, state);
  }

  public async captureState(
    group: GroupDTO | string,
    name: string,
  ): Promise<GroupDTO> {
    group = await this.load(group);
    if (!group) {
      throw new NotFoundException();
    }
    const base = this.getBaseGroup(group.type);
    return await base.captureState(group, name);
  }

  public async clone(
    target: string,
    { name, omitStates }: CloneGroupDTO,
  ): Promise<GroupDTO> {
    const source = await this.load(target);
    if (!source) {
      throw new NotFoundException();
    }
    return await this.create({
      entities: source.entities,
      friendlyName: name ?? `Copy of ${source.friendlyName}`,
      save_states: omitStates
        ? []
        : source.save_states.map(state => ({ ...state, id: v4() })),
      type: source.type,
    });
  }

  public async create<T extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS>(
    group: Omit<GroupDTO<T>, keyof BaseSchemaDTO>,
  ): Promise<GroupDTO<T>> {
    return await this.groupPersistence.create<T>(group);
  }

  public async delete(item: GroupDTO | string): Promise<boolean> {
    const group = is.string(item) ? item : item._id;
    const groupObject = await this.load(group);
    this.logger.info(`Removing [${groupObject.friendlyName}]`);
    const rooms = await this.roomService.list({
      filters: new Set([{ field: 'groups', value: group }]),
    });
    if (!is.empty(rooms)) {
      this.logger.debug(
        `[${groupObject.friendlyName}] detaching from {${rooms.length}} rooms`,
      );
    }
    await each(
      rooms,
      async room => await this.roomService.deleteGroup(room, group),
    );
    const routines = await this.routineService.list({
      filters: new Set([{ field: 'command.command.group', value: group }]),
    });
    await each(routines, async routine => {
      this.logger.debug(
        `Removing group [${groupObject.friendlyName}] from routine [${routine.friendlyName}]`,
      );
      await this.routineService.update(routine._id, {
        command: routine.command.filter(
          (command: RoutineCommandDTO<RoutineCommandGroupStateDTO>) =>
            !(
              ['group_action', 'group_state'].includes(command.type) &&
              command.command.group === group
            ),
        ),
      });
    });
    const out = await this.groupPersistence.delete(group);
    return out;
  }

  public async deleteReference(
    target: GroupDTO | string,
    reference: string,
  ): Promise<GroupDTO> {
    const group = await this.load(target);
    group.references ??= [];
    const references = group.references.filter(
      ({ target }) => target !== reference,
    );
    return await this.update(group._id, {
      references,
      save_states: group.save_states.map(type => ({
        ...type,
        states: type.states.filter(({ ref }) =>
          references.some(({ target }) => target === ref),
        ),
      })),
    });
  }

  public async deleteState<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    item: GroupDTO<GROUP_TYPE> | string,
    state: string,
  ): Promise<GroupDTO<GROUP_TYPE>> {
    const group = await this.load<GROUP_TYPE>(item);

    // Remove state from room states
    const rooms = await this.roomService.list({
      filters: new Set([{ field: 'save_states.states.ref', value: group }]),
    });
    await each(
      rooms,
      // Just detach the states, not the group
      async room => await this.roomService.deleteGroup(room, group._id, true),
    );

    // Remove commands setting it
    const routines = await this.routineService.list({
      filters: new Set([
        { field: 'command.command.group', value: group._id },
        { field: 'command.type', value: 'group_state' },
      ]),
    });
    await each(routines, async routine => {
      this.logger.debug(
        `Removing group [${group.friendlyName}] states from routine [${routine.friendlyName}]`,
      );
      await this.routineService.update(routine._id, {
        command: routine.command.filter(
          (command: RoutineCommandDTO<RoutineCommandGroupStateDTO>) =>
            !(
              command.type === 'group_state' && command.command.group === group
            ),
        ),
      });
    });
    const base = this.getBaseGroup(group.type);
    return await base.deleteState(group, state);
  }

  public async expandState<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    group: GroupDTO<GROUP_TYPE> | string,
    state: ROOM_ENTITY_EXTRAS,
  ): Promise<void> {
    group = await this.load(group);
    const base = this.getBaseGroup(group.type);
    base.expandState(group, state);
  }

  public getBaseGroup(type: GROUP_TYPES): BaseGroupService {
    switch (type) {
      case GROUP_TYPES.switch:
        return this.switchGroup;
      case GROUP_TYPES.fan:
        return this.fanGroup;
      case GROUP_TYPES.light:
        return this.lightGroup;
      case GROUP_TYPES.lock:
        return this.lockGroup;
      case GROUP_TYPES.group:
        return this.groupGroup;
      case GROUP_TYPES.room:
        return this.roomGroup;
      case GROUP_TYPES.person:
        return this.peopleGroup;
    }
    throw new NotImplementedException();
  }

  public async getWithStates<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    group: GroupDTO<GROUP_TYPE> | string,
    control: ResultControlDTO = {},
  ): Promise<GroupDTO<GROUP_TYPE>> {
    group = await this.load(group, control);
    if (!is.undefined(control.select)) {
      return group;
    }
    const base = this.getBaseGroup(group.type);
    group.state = {
      states: await base.getState(group),
    };
    return group;
  }

  public async list<GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS>(
    control: ResultControlDTO = {},
  ): Promise<GroupDTO<GROUP_TYPE>[]> {
    const out = await this.groupPersistence.findMany(control);
    return out as GroupDTO<GROUP_TYPE>[];
  }

  public async load<T extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS>(
    group: GroupDTO<T> | string,
    control: ResultControlDTO = {},
  ): Promise<GroupDTO<T>> {
    if (is.object(group)) {
      return group;
    }
    return await this.groupPersistence.findById(group, { control });
  }

  public async removeEntity<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    group: GroupDTO | string,
    entity: string | string[],
  ): Promise<GroupDTO<GROUP_TYPE>> {
    entity = is.string(entity) ? [entity] : entity;
    group = await this.load(group);
    group.entities = group.entities.filter(id => !entity.includes(id));
    return this.update(group._id, group);
  }

  public async truncate<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(group: GroupDTO<GROUP_TYPE> | string): Promise<GroupDTO<GROUP_TYPE>> {
    group = await this.load(group);
    group.save_states = [];
    return await this.update(group._id, group);
  }

  public async turnOff(group: GroupDTO | string): Promise<void> {
    group = await this.load(group);
    await each(group.entities, async entity => {
      await this.commandRouter.process(entity, 'turnOff');
    });
  }

  public async turnOn(
    group: GroupDTO | string,
    circadian = false,
  ): Promise<void> {
    group = await this.load(group);
    await each(group.entities, async entity => {
      if ((group as GroupDTO).type === GROUP_TYPES.light) {
        if (domain(entity) !== 'light') {
          await this.commandRouter.process(entity, 'turnOn');
          this.logger.warn({ entity }, `Invalid entity in light group`);
          return;
        }
        if (circadian) {
          await this.lightManager.circadianLight(entity);
          return;
        }
        await this.lightManager.turnOn(entity);
        return;
      }
      await this.commandRouter.process(entity, 'turnOn');
    });
  }

  public async update<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    id: string,
    data: Omit<Partial<GroupDTO>, keyof BaseSchemaDTO>,
  ): Promise<GroupDTO<GROUP_TYPE>> {
    return await this.groupPersistence.update(data, id);
  }

  public async updateState<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    group: string | GroupDTO,
    stateId: string,
    data: GroupSaveStateDTO,
  ): Promise<GroupDTO<GROUP_TYPE>> {
    group = await this.load(group);
    const state = group.save_states.find(({ id }) => id === stateId);
    state.states = data.states;
    state.friendlyName = data.friendlyName;
    return await this.groupPersistence.update(group, group._id);
  }
}
