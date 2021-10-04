import {
  CONCURRENT_CHANGES,
  GROUP_TYPES,
  GroupDTO,
  GroupPersistenceService,
  PersistenceLockStateDTO,
} from '@automagical/controller-logic';
import {
  domain,
  EntityManagerService,
  HASS_DOMAINS,
  LOCK_STATES,
  LockDomainService,
  LockStateDTO,
} from '@automagical/home-assistant';
import { AutoLogService, InjectConfig, Trace } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { each, eachLimit } from 'async';

import { BaseGroupService } from './base-group.service';

const START = 0;

@Injectable()
export class LockGroupService extends BaseGroupService {
  constructor(
    protected readonly logger: AutoLogService,
    private readonly lockSerivice: LockDomainService,
    private readonly entityManager: EntityManagerService,
    protected readonly groupPersistence: GroupPersistenceService,
    @InjectConfig(CONCURRENT_CHANGES)
    private readonly eachLimit: number,
  ) {
    super();
  }

  public readonly GROUP_TYPE = GROUP_TYPES.lock;

  @Trace()
  public getState(group: GroupDTO<LockStateDTO>): PersistenceLockStateDTO[] {
    return group.entities.map((id) => {
      const [light] = this.entityManager.getEntity<LockStateDTO>([id]);
      return {
        state: light.state,
      } as PersistenceLockStateDTO;
    });
  }

  @Trace()
  public isValidEntity(id: string): boolean {
    return domain(id) === HASS_DOMAINS.fan;
  }

  @Trace()
  public async lock(group: GroupDTO | string): Promise<void> {
    if (typeof group === 'string') {
      group = await this.groupPersistence.findById(group);
    }
    await each(group.entities, async (lock, callback) => {
      if (!this.isValid(lock)) {
        throw new InternalServerErrorException(
          `Invalid lock group entity: ${lock}`,
        );
      }
      await this.lockSerivice.lock(lock);
      callback();
    });
  }

  /**
   * Alias for unlock
   */
  @Trace()
  public async turnOff(group: GroupDTO | string): Promise<void> {
    return this.unlock(group);
  }

  /**
   * Alias for lock
   */
  @Trace()
  public async turnOn(group: GroupDTO | string): Promise<void> {
    return this.lock(group);
  }

  @Trace()
  public async unlock(group: GroupDTO | string): Promise<void> {
    if (typeof group === 'string') {
      group = await this.groupPersistence.findById(group);
    }
    await each(group.entities, async (lock, callback) => {
      if (!this.isValid(lock)) {
        throw new InternalServerErrorException(
          `Invalid lock group entity: ${lock}`,
        );
      }
      await this.lockSerivice.unlock(lock);
      callback();
    });
  }

  @Trace()
  protected async setState(
    entites: string[],
    state: PersistenceLockStateDTO[],
  ): Promise<void> {
    if (entites.length !== state.length) {
      this.logger.warn(`State and entity length mismatch`);
      state = state.slice(START, entites.length);
    }
    await eachLimit(
      state.map((state, index) => {
        return [entites[index], state];
      }) as [string, PersistenceLockStateDTO][],
      this.eachLimit,
      async ([id, state], callback) => {
        if (state.state === LOCK_STATES.locked) {
          await this.lockSerivice.lock(id);
          return callback();
        }
        await this.lockSerivice.unlock(id);
        callback();
      },
    );
  }

  private isValid(id: string | string[]): boolean {
    if (typeof id === 'string') {
      return domain(id) === HASS_DOMAINS.lock;
    }
    return id.every((item) => domain(item) === HASS_DOMAINS.lock);
  }
}
