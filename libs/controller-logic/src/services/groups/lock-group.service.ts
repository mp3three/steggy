import {
  GroupDTO,
  GroupPersistenceService,
} from '@automagical/controller-logic';
import {
  domain,
  HASS_DOMAINS,
  LockDomainService,
} from '@automagical/home-assistant';
import { Trace } from '@automagical/utilities';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { each } from 'async';

/**
 * At this time, lock groups do not support state persistence
 *
 * It's basically a glorified wrapper around lock domain
 */
@Injectable()
export class LockGroupService {
  constructor(
    private readonly lockSerivice: LockDomainService,
    private readonly persistence: GroupPersistenceService,
  ) {}

  @Trace()
  public async lock(group: GroupDTO | string): Promise<void> {
    if (typeof group === 'string') {
      group = await this.persistence.findById(group);
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
      group = await this.persistence.findById(group);
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

  private isValid(id: string | string[]): boolean {
    if (typeof id === 'string') {
      return domain(id) === HASS_DOMAINS.lock;
    }
    return id.every((item) => domain(item) === HASS_DOMAINS.lock);
  }
}
