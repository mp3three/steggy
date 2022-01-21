import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@text-based/boilerplate';
import {
  domain,
  EntityManagerService,
  FanDomainService,
  FanStateDTO,
  HASS_DOMAINS,
  HomeAssistantCoreService,
} from '@text-based/home-assistant';
import { each } from '@text-based/utilities';

import {
  FanCacheDTO,
  GROUP_TYPES,
  GroupCommandDTO,
  GroupDTO,
  RoomEntitySaveStateDTO,
} from '../../contracts';
import { GroupPersistenceService } from '../persistence';
import { BaseGroupService } from './base-group.service';

type SaveState = RoomEntitySaveStateDTO<FanCacheDTO>;

const START = 0;
@Injectable()
export class FanGroupService extends BaseGroupService {
  constructor(
    protected readonly logger: AutoLogService,
    protected readonly groupPersistence: GroupPersistenceService,
    private readonly hassCore: HomeAssistantCoreService,
    private readonly entityManager: EntityManagerService,
    private readonly fanDomain: FanDomainService,
  ) {
    super();
  }
  public readonly GROUP_TYPE: GROUP_TYPES.fan;

  public async activateCommand(
    group: GroupDTO<FanCacheDTO> | string,
    state: GroupCommandDTO,
  ): Promise<void> {
    switch (state.command) {
      case 'turnOff':
        await this.turnOff(group);
        return;
      case 'turnOn':
        await this.turnOn(group);
        return;
      case 'fanSpeedUp':
        await this.fanSpeedUp(group);
        return;
      case 'fanSpeedDown':
        await this.fanSpeedDown(group);
        return;
      default:
        await this.activateState(group, state.command);
    }
  }

  public async fanSpeedDown(group: GroupDTO | string): Promise<void> {
    group = await this.loadGroup(group);
    await each(group.entities, async entity_id => {
      await this.fanDomain.fanSpeedDown(entity_id);
    });
  }

  public async fanSpeedUp(group: GroupDTO | string): Promise<void> {
    group = await this.loadGroup(group);
    await each(group.entities, async entity_id => {
      await this.fanDomain.fanSpeedUp(entity_id);
    });
  }

  public async getState(group: GroupDTO<FanCacheDTO>): Promise<SaveState[]> {
    return await group.entities.map(id => {
      const fan = this.entityManager.getEntity<FanStateDTO>(id);
      return {
        extra: {
          speed: fan.attributes.speed,
        },
        ref: fan.entity_id,
        state: fan.state,
      } as SaveState;
    });
  }

  public isValidEntity(id: string): boolean {
    return domain(id) === HASS_DOMAINS.fan;
  }

  public async setState(
    entites: string[],
    state: RoomEntitySaveStateDTO[],
  ): Promise<void> {
    if (entites.length !== state.length) {
      this.logger.warn(`State and entity length mismatch`);
      state = state.slice(START, entites.length);
    }
    await each(
      state.map((state, index) => {
        return [entites[index], state];
      }) as [string, RoomEntitySaveStateDTO<FanCacheDTO>][],
      async ([id, state]) => {
        if (state.state === 'off') {
          await this.fanDomain.turnOff(id);
          return;
        }
        await this.fanDomain.setSpeed(id, state.extra.speed);
      },
    );
  }

  public async turnOff(group: GroupDTO<FanCacheDTO> | string): Promise<void> {
    group = await this.loadGroup(group);
    await this.hassCore.turnOff(group.entities);
  }

  public async turnOn(group: GroupDTO | string): Promise<void> {
    group = await this.loadGroup(group);
    await this.hassCore.turnOn(group.entities);
  }
}
