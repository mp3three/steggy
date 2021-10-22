import { AutoLogService, Trace } from '@automagical/utilities';
import { Injectable, NotImplementedException } from '@nestjs/common';
import { each } from 'async';

import { GROUP_TYPES, SaveStateDTO } from '../contracts';
import { EntityCommandRouterService } from './entity-command-router.service';
import {
  BaseGroupService,
  FanGroupService,
  GroupService,
  LightGroupService,
  LockGroupService,
  SwitchGroupService,
} from './groups';
import { SaveStatePersistenceService } from './persistence';

@Injectable()
export class SaveStateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly persistence: SaveStatePersistenceService,
    private readonly commandRouter: EntityCommandRouterService,
    private readonly lightGroup: LightGroupService,
    private readonly lockGroup: LockGroupService,
    private readonly fanGroup: FanGroupService,
    private readonly switchGroup: SwitchGroupService,
    private readonly groupService: GroupService,
  ) {}

  @Trace()
  public async activate(state: SaveStateDTO | string): Promise<void> {
    state = await this.load(state);
    await Promise.all([
      await this.activateEntities(state),
      await this.activateGroup(state),
    ]);
  }

  @Trace()
  private async activateEntities(state: SaveStateDTO): Promise<void> {
    await each(state.entities, async (entity, callback) => {
      await this.commandRouter.process(
        entity.entity_id,
        entity.state,
        entity.extra as Record<string, unknown>,
      );
      callback();
    });
  }

  @Trace()
  private async activateGroup(state: SaveStateDTO): Promise<void> {
    await each(Object.entries(state.groups), async ([id, state], callback) => {
      const group = await this.groupService.load(id);
      const base = this.getBaseGroup(group.type);
      await base.activateState(group, state);
      callback();
    });
  }

  @Trace()
  private getBaseGroup(type: GROUP_TYPES): BaseGroupService {
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

  @Trace()
  private async load(state: SaveStateDTO | string): Promise<SaveStateDTO> {
    state = typeof state === 'string' ? state : state._id;
    return await this.persistence.findById(state);
  }
}
