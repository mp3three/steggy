import { AutoLogService } from '@steggy/boilerplate';
import type {
  GroupSaveStateDTO,
  ROOM_ENTITY_EXTRAS,
  RoutineCommandGroupActionDTO,
  RoutineCommandGroupStateDTO,
} from '@steggy/controller-shared';
import { GROUP_TYPES, GroupDTO } from '@steggy/controller-shared';
import { domain, HASS_DOMAINS } from '@steggy/home-assistant-shared';
import { BaseSchemaDTO } from '@steggy/persistence';
import { each, is, ResultControlDTO } from '@steggy/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';

import { EntityCommandRouterService } from '../entity-command-router.service';
import { LightManagerService } from '../lighting';
import { GroupPersistenceService } from '../persistence';
import { BaseGroupService } from './base-group.service';
import { FanGroupService } from './fan-group.service';
import { LightGroupService } from './light-group.service';
import { LockGroupService } from './lock-group.service';
import { SwitchGroupService } from './switch-group.service';

@Injectable()
export class GroupService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly groupPersistence: GroupPersistenceService,
    private readonly lightGroup: LightGroupService,
    private readonly lockGroup: LockGroupService,
    private readonly fanGroup: FanGroupService,
    private readonly switchGroup: SwitchGroupService,
    private readonly lightManager: LightManagerService,
    private readonly commandRouter: EntityCommandRouterService,
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
    const base = this.getBaseGroup(group.type);
    return await base.addState(group, state);
  }

  public async captureState(
    group: GroupDTO | string,
    name: string,
  ): Promise<GroupDTO> {
    group = await this.load(group);
    const base = this.getBaseGroup(group.type);
    return await base.captureState(group, name);
  }

  public async create<T extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS>(
    group: Omit<GroupDTO<T>, keyof BaseSchemaDTO>,
  ): Promise<GroupDTO<T>> {
    return await this.groupPersistence.create<T>(group);
  }

  public async delete(group: GroupDTO | string): Promise<boolean> {
    group = is.string(group) ? group : group._id;
    return await this.groupPersistence.delete(group);
  }

  public async deleteState<
    GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS,
  >(
    group: GroupDTO<GROUP_TYPE> | string,
    state: string,
  ): Promise<GroupDTO<GROUP_TYPE>> {
    group = await this.load<GROUP_TYPE>(group);
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

  public async get<GROUP_TYPE extends ROOM_ENTITY_EXTRAS = ROOM_ENTITY_EXTRAS>(
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
    }
    throw new NotImplementedException();
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
        if (domain(entity) !== HASS_DOMAINS.light) {
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
