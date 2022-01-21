import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AutoLogService } from '@text-based/boilerplate';
import {
  domain,
  EntityManagerService,
  HASS_DOMAINS,
  LOCK_STATES,
  LockDomainService,
  LockStateDTO,
} from '@text-based/home-assistant';
import { each, is } from '@text-based/utilities';

import {
  GROUP_TYPES,
  GroupCommandDTO,
  GroupDTO,
  LightingCacheDTO,
  RoomEntitySaveStateDTO,
} from '../../contracts';
import { GroupPersistenceService } from '../persistence';
import { BaseGroupService } from './base-group.service';

const START = 0;

@Injectable()
export class LockGroupService extends BaseGroupService {
  constructor(
    protected readonly logger: AutoLogService,
    private readonly lockSerivice: LockDomainService,
    private readonly entityManager: EntityManagerService,
    protected readonly groupPersistence: GroupPersistenceService,
  ) {
    super();
  }

  public readonly GROUP_TYPE = GROUP_TYPES.lock;

  public async activateCommand(
    group: GroupDTO | string,
    state: GroupCommandDTO,
  ): Promise<void> {
    switch (state.command) {
      case 'lock':
        await this.lock(group);
        return;
      case 'unlock':
        await this.unlock(group);
        return;
      default:
        await this.activateState(group, state.command);
    }
  }

  public async getState(
    group: GroupDTO<LightingCacheDTO>,
  ): Promise<RoomEntitySaveStateDTO[]> {
    return await group.entities.map(id => {
      const lock = this.entityManager.getEntity<LockStateDTO>(id);
      return {
        ref: lock.entity_id,
        state: lock.state,
      };
    });
  }

  public isValidEntity(id: string): boolean {
    return domain(id) === HASS_DOMAINS.fan;
  }

  public async lock(group: GroupDTO | string): Promise<void> {
    if (is.string(group)) {
      group = await this.groupPersistence.findById(group);
    }
    await each(group.entities, async lock => {
      if (!this.isValid(lock)) {
        throw new InternalServerErrorException(
          `Invalid lock group entity: ${lock}`,
        );
      }
      await this.lockSerivice.lock(lock);
    });
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
      }) as [string, RoomEntitySaveStateDTO][],
      async ([id, state]) => {
        if (state.state === LOCK_STATES.locked) {
          await this.lockSerivice.lock(id);
          return;
        }
        await this.lockSerivice.unlock(id);
      },
    );
  }

  /**
   * Alias for unlock
   */
  public async turnOff(group: GroupDTO | string): Promise<void> {
    return this.unlock(group);
  }

  /**
   * Alias for lock
   */
  public async turnOn(group: GroupDTO | string): Promise<void> {
    return this.lock(group);
  }

  public async unlock(group: GroupDTO | string): Promise<void> {
    if (is.string(group)) {
      group = await this.groupPersistence.findById(group);
    }
    await each(group.entities, async lock => {
      if (!this.isValid(lock)) {
        throw new InternalServerErrorException(
          `Invalid lock group entity: ${lock}`,
        );
      }
      await this.lockSerivice.unlock(lock);
    });
  }

  private isValid(id: string | string[]): boolean {
    if (is.string(id)) {
      return domain(id) === HASS_DOMAINS.lock;
    }
    return id.every(item => domain(item) === HASS_DOMAINS.lock);
  }
}
