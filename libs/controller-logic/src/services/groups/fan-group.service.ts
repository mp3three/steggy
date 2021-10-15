import {
  domain,
  EntityManagerService,
  FanDomainService,
  FanStateDTO,
  HASS_DOMAINS,
  HomeAssistantCoreService,
} from '@automagical/home-assistant';
import { AutoLogService, InjectConfig, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { eachLimit } from 'async';

import { CONCURRENT_CHANGES } from '../../config';
import {
  GROUP_TYPES,
  GroupDTO,
  PersistenceFanStateDTO,
  RoomGroupSaveStateDTO,
} from '../../contracts';
import { GroupPersistenceService } from '../persistence';
import { BaseGroupService } from './base-group.service';

const START = 0;
@Injectable()
export class FanGroupService extends BaseGroupService {
  constructor(
    protected readonly logger: AutoLogService,
    protected readonly groupPersistence: GroupPersistenceService,
    private readonly hassCore: HomeAssistantCoreService,
    private readonly entityManager: EntityManagerService,
    private readonly fanDomain: FanDomainService,
    @InjectConfig(CONCURRENT_CHANGES)
    private readonly eachLimit: number,
  ) {
    super();
  }
  public readonly GROUP_TYPE: GROUP_TYPES.fan;

  @Trace()
  public async activateCommand(
    group: GroupDTO | string,
    state: RoomGroupSaveStateDTO,
  ): Promise<void> {
    switch (state.action) {
      case 'turnOff':
        await this.turnOff(group);
        return;
      case 'turnOn':
        await this.turnOn(group);
        return;
      default:
        await this.activateState(group, state.action);
    }
  }

  @Trace()
  public getState(
    group: GroupDTO<PersistenceFanStateDTO>,
  ): PersistenceFanStateDTO[] {
    return group.entities.map((id) => {
      const fan = this.entityManager.getEntity<FanStateDTO>(id);
      return {
        speed: fan.attributes.speed,
        state: fan.state,
      } as PersistenceFanStateDTO;
    });
  }

  @Trace()
  public isValidEntity(id: string): boolean {
    return domain(id) === HASS_DOMAINS.fan;
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
    state: PersistenceFanStateDTO[],
  ): Promise<void> {
    if (entites.length !== state.length) {
      this.logger.warn(`State and entity length mismatch`);
      state = state.slice(START, entites.length);
    }
    await eachLimit(
      state.map((state, index) => {
        return [entites[index], state];
      }) as [string, PersistenceFanStateDTO][],
      this.eachLimit,
      async ([id, state], callback) => {
        if (state.state === 'off') {
          await this.fanDomain.turnOff(id);
          return callback();
        }
        await this.fanDomain.setSpeed(id, state.speed);
        callback();
      },
    );
  }
}
