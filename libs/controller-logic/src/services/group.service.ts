import { LockStateDTO } from '@automagical/home-assistant';
import { BaseSchemaDTO } from '@automagical/persistence';
import { ResultControlDTO, Trace } from '@automagical/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';

import {
  BASIC_STATE,
  GROUP_TYPES,
  GroupDTO,
  PersistenceLightStateDTO,
  PersistenceSwitchStateDTO,
} from '../contracts';
import {
  LightGroupService,
  LockGroupService,
  SwitchGroupService,
} from './groups';
import { GroupPersistenceService } from './persistence';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupPersistence: GroupPersistenceService,
    private readonly lightGroup: LightGroupService,
    private readonly lockGroup: LockGroupService,
    private readonly switchGroup: SwitchGroupService,
  ) {}

  @Trace()
  public async activateState(
    group: GroupDTO | string,
    state: string,
  ): Promise<void> {
    group = await this.load(group);
    switch (group.type) {
      case GROUP_TYPES.switch:
        return await this.switchGroup.activateState(
          group as GroupDTO<PersistenceSwitchStateDTO>,
          state,
        );
      case GROUP_TYPES.light:
        return await this.lightGroup.activateState(
          group as GroupDTO<PersistenceLightStateDTO>,
          state,
        );
      case GROUP_TYPES.lock:
        return await this.lockGroup.activateState(
          group as GroupDTO<LockStateDTO>,
          state,
        );
    }
    throw new NotImplementedException();
  }

  @Trace()
  public async addEntity<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    group: GroupDTO | string,
    entity: string | string[],
  ): Promise<GroupDTO<GROUP_TYPE>> {
    entity = typeof entity === 'string' ? [entity] : entity;
    group = await this.load(group);
    group.entities = [
      ...group.entities.filter((id) => !entity.includes(id)),
      ...entity,
    ];
    return this.update(group);
  }

  @Trace()
  public async captureState(
    group: GroupDTO | string,
    name: string,
  ): Promise<string> {
    group = await this.load(group);
    switch (group.type) {
      case GROUP_TYPES.switch:
        return await this.switchGroup.captureState(
          group as GroupDTO<PersistenceSwitchStateDTO>,
          name,
        );
      case GROUP_TYPES.light:
        return await this.lightGroup.captureState(
          group as GroupDTO<PersistenceLightStateDTO>,
          name,
        );
      case GROUP_TYPES.lock:
        return await this.lockGroup.captureState(
          group as GroupDTO<LockStateDTO>,
          name,
        );
    }
    throw new NotImplementedException();
  }

  @Trace()
  public async create(
    group: Omit<GroupDTO, keyof BaseSchemaDTO>,
  ): Promise<GroupDTO> {
    return await this.groupPersistence.create(group);
  }

  @Trace()
  public async delete(group: GroupDTO | string): Promise<boolean> {
    group = typeof group === 'string' ? group : group._id;
    return await this.groupPersistence.delete(group);
  }

  @Trace()
  public async get(group: GroupDTO | string): Promise<GroupDTO> {
    group = await this.load(group);
    switch (group.type) {
      case GROUP_TYPES.switch:
        group.state = await this.switchGroup.getState(
          group as GroupDTO<PersistenceSwitchStateDTO>,
        );
        break;
      case GROUP_TYPES.light:
        group.state = await this.lightGroup.getState(
          group as GroupDTO<PersistenceLightStateDTO>,
        );
        break;
      case GROUP_TYPES.lock:
        group.state = await this.lockGroup.getState(
          group as GroupDTO<LockStateDTO>,
        );
        break;
    }
    return group;
  }

  @Trace()
  public async list<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    control: ResultControlDTO = {},
  ): Promise<GroupDTO<GROUP_TYPE>[]> {
    return await this.groupPersistence.findMany(control);
  }

  @Trace()
  public async removeEntity<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    group: GroupDTO | string,
    entity: string | string[],
  ): Promise<GroupDTO<GROUP_TYPE>> {
    entity = typeof entity === 'string' ? [entity] : entity;
    group = await this.load(group);
    group.entities = group.entities.filter((id) => !entity.includes(id));
    return this.update(group);
  }

  @Trace()
  public async update<GROUP_TYPE extends BASIC_STATE = BASIC_STATE>(
    group: GroupDTO,
  ): Promise<GroupDTO<GROUP_TYPE>> {
    return await this.groupPersistence.update(group);
  }

  @Trace()
  private async load(group: GroupDTO | string): Promise<GroupDTO> {
    if (typeof group === 'object') {
      return group;
    }
    return await this.groupPersistence.findById(group);
  }
}
