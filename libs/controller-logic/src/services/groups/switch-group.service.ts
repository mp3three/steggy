import {
  CONCURRENT_CHANGES,
  GroupDTO,
  GroupPersistenceService,
  PersistenceLightStateDTO,
  PersistenceSwitchStateDTO,
} from '@automagical/controller-logic';
import {
  EntityManagerService,
  HomeAssistantCoreService,
  SwitchStateDTO,
} from '@automagical/home-assistant';
import { AutoLogService, InjectConfig, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { eachLimit } from 'async';

import { BaseGroupService } from './base-group.service';

const START = 0;
@Injectable()
export class SwitchGroupService extends BaseGroupService {
  constructor(
    protected readonly logger: AutoLogService,
    private readonly entityManager: EntityManagerService,
    private readonly hassCore: HomeAssistantCoreService,
    protected readonly groupPersistence: GroupPersistenceService,
    @InjectConfig(CONCURRENT_CHANGES)
    private readonly eachLimit: number,
  ) {
    super();
  }

  @Trace()
  public getState(
    group: GroupDTO<PersistenceSwitchStateDTO>,
  ): PersistenceSwitchStateDTO[] {
    return group.entities.map((id) => {
      const [light] = this.entityManager.getEntity<SwitchStateDTO>([id]);
      return {
        state: light.state,
      } as PersistenceSwitchStateDTO;
    });
  }

  @Trace()
  public async turnOff(group: GroupDTO | string): Promise<void> {
    group = await this.loadGroup(group);
    await this.hassCore.turnOff(group.entities);
  }

  @Trace()
  public async turnOn(group: GroupDTO | string): Promise<void> {
    group = await this.loadGroup(group);
    await this.hassCore.turnOn(group.entities);
  }

  @Trace()
  protected async setState(
    entites: string[],
    state: PersistenceLightStateDTO[],
  ): Promise<void> {
    if (entites.length !== state.length) {
      this.logger.warn(`State and entity length mismatch`);
      state = state.slice(START, entites.length);
    }
    await eachLimit(
      state.map((state, index) => {
        return [entites[index], state];
      }) as [string, PersistenceLightStateDTO][],
      this.eachLimit,
      async ([id, state], callback) => {
        if (state.state === 'off') {
          await this.hassCore.turnOff(id);
          return callback();
        }
        await this.hassCore.turnOn(id);
        callback();
      },
    );
  }
}
