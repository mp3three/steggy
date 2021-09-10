import {
  iRoomController,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import {
  AutoLogService,
  CacheManagerService,
  InjectCache,
  InjectLogger,
  Trace,
} from '@automagical/utilities';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';
import { each } from 'async';

const CACHE_KEY = (room, flag) => `FLAGS:${room}/${flag}`;
/**
 * This service exists to manage room flags.
 * Future expansion as specific room functionality demands it's own state management
 */
@Injectable({ scope: Scope.TRANSIENT })
export class StateManagerService {
  constructor(
    @Inject(INQUIRER)
    private readonly controller: Partial<iRoomController>,
    @InjectCache() private readonly cacheService: CacheManagerService,
    @InjectLogger() private readonly logger: AutoLogService,
  ) {}

  private get settings(): RoomControllerSettingsDTO {
    return this.controller.constructor[ROOM_CONTROLLER_SETTINGS];
  }

  @Trace()
  public async addFlag(flagName: string): Promise<void> {
    if (await this.hasFlag(flagName)) {
      return;
    }
    this.logger.debug(`[${this.settings.friendlyName}] Add flag {${flagName}}`);
    const name = CACHE_KEY(this.settings.name, flagName);
    await this.cacheService.set(name, true, {
      ttl: 24 * 60 * 60,
    });
  }

  @Trace()
  public async hasFlag(flagName: string): Promise<boolean> {
    return await this.cacheService.wrap<boolean>(
      CACHE_KEY(this.settings.name, flagName),
      () => false,
    );
  }

  @Trace()
  public async removeFlag(flagName: string): Promise<void> {
    if (!(await this.hasFlag(flagName))) {
      return;
    }
    this.logger.debug(
      `[${this.settings.friendlyName}] Remove flag {${flagName}}`,
    );
    this.cacheService.del(CACHE_KEY(this.settings.name, flagName));
  }

  /**
   * For confirmation / debugging sake only
   *
   * Each request should always hit cache
   */
  @Trace()
  protected async onModuleInit(): Promise<void> {
    const list: string[] = await this.cacheService.store.keys();
    const prefix = CACHE_KEY(this.settings.name, '');
    const loadedCache = {};
    await each(list, async (key, callback) => {
      if (key.slice(0, prefix.length) !== prefix) {
        return callback();
      }
      loadedCache[key.slice(prefix.length)] = await this.cacheService.get(key);
      callback();
    });
    this.logger.debug(
      loadedCache,
      `[${this.settings.friendlyName}] loaded state`,
    );
  }
}
