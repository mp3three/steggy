import { iRoomController } from '@automagical/contracts';
import {
  RoomControllerSettingsDTO,
  RoomStateDTO,
} from '@automagical/contracts/controller-logic';
import {
  CacheManagerService,
  InjectCache,
  Trace,
} from '@automagical/utilities';
import { Injectable, Scope } from '@nestjs/common';

const CACHE_KEY = (room, flag) => `FLAGS:${room}/${flag}`;
/**
 * Intended to operate 1=1 with room controllers
 */
@Injectable({ scope: Scope.TRANSIENT })
export class StateManagerService {
  // #region Object Properties

  public controller: Partial<iRoomController>;
  public settings: RoomControllerSettingsDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectCache() private readonly cacheService: CacheManagerService,
  ) {}

  // #endregion Constructors

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
  public async removeFlag(flagName: string): Promise<void> {
    this.cacheService.del(CACHE_KEY(this.settings.name, flagName));
  }

  // #endregion Public Methods
}
