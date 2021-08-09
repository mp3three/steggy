import { iRoomController } from '@automagical/contracts';
import {
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import {
  CacheManagerService,
  InjectCache,
  Trace,
} from '@automagical/utilities';
import { Inject, Injectable, Scope } from '@nestjs/common';
import { INQUIRER } from '@nestjs/core';

const CACHE_KEY = (room, flag) => `FLAGS:${room}/${flag}`;
/**
 * This service exists to manage room flags.
 * Future expansion as specific room functionality demands it's own state management
 */
@Injectable({ scope: Scope.TRANSIENT })
export class StateManagerService {
  // #region Constructors

  constructor(
    @Inject(INQUIRER)
    private readonly controller: Partial<iRoomController>,
    @InjectCache() private readonly cacheService: CacheManagerService,
  ) {}

  // #endregion Constructors

  // #region Private Accessors

  private get settings(): RoomControllerSettingsDTO {
    return this.controller.constructor[ROOM_CONTROLLER_SETTINGS];
  }

  // #endregion Private Accessors

  // #region Public Methods

  @Trace()
  public async addFlag(flagName: string): Promise<void> {
    await this.cacheService.set(CACHE_KEY(this.settings.name, flagName), true);
  }

  @Trace()
  public async hasFlag(flagName: string): Promise<boolean> {
    return await this.cacheService.wrap<boolean>(
      CACHE_KEY(this.settings.name, flagName),
      () => false,
    );
  }

  @Trace()
  public async init(): Promise<void> {
    //
  }

  @Trace()
  public async removeFlag(flagName: string): Promise<void> {
    this.cacheService.del(CACHE_KEY(this.settings.name, flagName));
  }

  // #endregion Public Methods
}
