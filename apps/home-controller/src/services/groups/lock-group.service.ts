import { AutoLogService } from '@automagical/boilerplate';
import {
  GROUP_TYPES,
  GroupCommandDTO,
  GroupDTO,
  RoomEntitySaveStateDTO,
} from '@automagical/controller-shared';
import {
  EntityManagerService,
  LockDomainService,
} from '@automagical/home-assistant';
import {
  domain,
  HASS_DOMAINS,
  LOCK_STATES,
  LockAttributesDTO,
  LockStateDTO,
} from '@automagical/home-assistant-shared';
import { each, is } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

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
    waitForChange = false,
  ): Promise<void> {
    switch (state.command) {
      case 'lock':
      case 'locked':
        await this.lock(group, waitForChange);
        return;
      case 'unlock':
      case 'unlocked':
        await this.unlock(group, waitForChange);
        return;
      default:
        await this.activateState(group, state.command, waitForChange);
    }
  }

  public async getState(
    group: GroupDTO<LockAttributesDTO>,
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

  public async lock(
    group: GroupDTO | string,
    waitForChange = false,
  ): Promise<void> {
    if (is.string(group)) {
      group = await this.groupPersistence.findById(group);
    }
    await each(group.entities, async lock => {
      if (!this.isValid(lock)) {
        throw new InternalServerErrorException(
          `Invalid lock group entity: ${lock}`,
        );
      }
      await this.lockSerivice.lock(lock, waitForChange);
    });
  }

  public async setState(
    entities: string[],
    state: RoomEntitySaveStateDTO[],
    waitForChange = false,
  ): Promise<void> {
    if (entities.length !== state.length) {
      this.logger.warn(`State and entity length mismatch`);
      state = state.slice(START, entities.length);
    }
    await each(
      state.map((state, index) => {
        return [entities[index], state];
      }) as [string, RoomEntitySaveStateDTO][],
      async ([id, state]) => {
        if (state.state === LOCK_STATES.locked) {
          await this.lockSerivice.lock(id, waitForChange);
          return;
        }
        await this.lockSerivice.unlock(id, waitForChange);
      },
    );
  }

  /**
   * Alias for unlock
   */
  public async turnOff(
    group: GroupDTO | string,
    waitForChange = false,
  ): Promise<void> {
    return this.unlock(group, waitForChange);
  }

  /**
   * Alias for lock
   */
  public async turnOn(
    group: GroupDTO | string,
    waitForChange = false,
  ): Promise<void> {
    return this.lock(group, waitForChange);
  }

  public async unlock(
    group: GroupDTO | string,
    waitForChange = false,
  ): Promise<void> {
    if (is.string(group)) {
      group = await this.groupPersistence.findById(group);
    }
    await each(group.entities, async lock => {
      if (!this.isValid(lock)) {
        throw new InternalServerErrorException(
          `Invalid lock group entity: ${lock}`,
        );
      }
      await this.lockSerivice.unlock(lock, waitForChange);
    });
  }

  private isValid(id: string | string[]): boolean {
    if (is.string(id)) {
      return domain(id) === HASS_DOMAINS.lock;
    }
    return id.every(item => domain(item) === HASS_DOMAINS.lock);
  }
}
