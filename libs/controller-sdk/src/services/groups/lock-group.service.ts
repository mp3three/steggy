import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  GeneralSaveStateDTO,
  GROUP_TYPES,
  GroupCommandDTO,
  GroupDTO,
} from '@steggy/controller-shared';
import {
  EntityManagerService,
  LockDomainService,
} from '@steggy/home-assistant';
import {
  domain,
  LOCK_STATES,
  LockAttributesDTO,
  LockStateDTO,
} from '@steggy/home-assistant-shared';
import { each, is, START } from '@steggy/utilities';

import { GroupPersistenceService } from '../persistence';
import { BaseGroupService } from './base-group.service';

@Injectable()
export class LockGroupService extends BaseGroupService {
  constructor(
    protected readonly logger: AutoLogService,
    private readonly lockService: LockDomainService,
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
  ): Promise<GeneralSaveStateDTO[]> {
    return await group.entities.map(id => {
      const lock = this.entityManager.getEntity<LockStateDTO>(id);
      return {
        ref: lock.entity_id,
        state: lock.state,
      };
    });
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
      await this.lockService.lock(lock, waitForChange);
    });
  }

  public async setState(
    entities: string[],
    state: GeneralSaveStateDTO[],
    waitForChange = false,
  ): Promise<void> {
    if (entities.length !== state.length) {
      this.logger.warn(`State and entity length mismatch`);
      state = state.slice(START, entities.length);
    }
    await each(
      state.map((state, index) => {
        return [entities[index], state];
      }) as [string, GeneralSaveStateDTO][],
      async ([id, state]) => {
        if (state.state === LOCK_STATES.locked) {
          await this.lockService.lock(id, waitForChange);
          return;
        }
        await this.lockService.unlock(id, waitForChange);
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
      await this.lockService.unlock(lock, waitForChange);
    });
  }

  private isValid(id: string | string[]): boolean {
    if (is.string(id)) {
      return domain(id) === 'lock';
    }
    return id.every(item => domain(item) === 'lock');
  }
}
