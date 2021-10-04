import { BaseSchemaDTO } from '@automagical/persistence';
import { ResultControlDTO, Trace } from '@automagical/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';

import { BASIC_STATE, GROUP_TYPES, GroupDTO } from '../contracts';
import {
  FanGroupService,
  LightGroupService,
  LockGroupService,
  SwitchGroupService,
} from './groups';
import { BaseGroupService } from './groups/base-group.service';
import { GroupPersistenceService } from './persistence';

@Injectable()
export class GroupService {
  constructor(
    private readonly groupPersistence: GroupPersistenceService,
    private readonly lightGroup: LightGroupService,
    private readonly lockGroup: LockGroupService,
    private readonly fanGroup: FanGroupService,
    private readonly switchGroup: SwitchGroupService,
  ) {}

  @Trace()
  public async activateState(
    group: GroupDTO | string,
    state: string,
  ): Promise<void> {
    group = await this.load(group);
    const base = this.getBaseGroup(group);
    return await base.activateState(group, state);
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
    const base = this.getBaseGroup(group);
    return await base.captureState(group, name);
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
    const base = this.getBaseGroup(group);
    group.state = await base.getState(group);
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
  private getBaseGroup(group: GroupDTO): BaseGroupService {
    switch (group.type) {
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

  @Trace()
  private async load(group: GroupDTO | string): Promise<GroupDTO> {
    if (typeof group === 'object') {
      return group;
    }
    return await this.groupPersistence.findById(group);
  }
}
