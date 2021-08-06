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

const CACHE_KEY = (room) => `${room}`;
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
    const current = await this.getState();
    this.setStateProperty('activeFlags', [...current.activeFlags, flagName]);
  }

  @Trace()
  public async getState(): Promise<RoomStateDTO> {
    return (
      (await this.cacheService.get(CACHE_KEY(this.settings.name))) ?? {
        activeFlags: [],
        lightingMode: 'unmanaged',
        lights: {},
      }
    );
  }

  @Trace()
  public async hasFlag(flagName: string): Promise<boolean> {
    const state = await this.getState();
    return state.activeFlags.includes(flagName);
  }

  @Trace()
  public async setStateProperty(
    key: keyof RoomStateDTO,
    value: unknown,
  ): Promise<void> {
    const cache = await this.getState();
    await this.cacheService.set(CACHE_KEY(this.settings.name), {
      ...cache,
      [key]: value,
    });
  }

  // #endregion Public Methods

  // #region Protected Methods

  protected finalize(): void {
    ['areaOff', 'areaOn', 'dimDown', 'dimUp', 'favorite'].forEach((key) => {
      if (this.controller[key]) {
        const descriptor = Object.getOwnPropertyDescriptor(
          this.controller,
          key,
        );
        const original = descriptor.value;
        descriptor.value = function (...parameters) {
          const value = original.apply(this, parameters);
          if (value === false) {
            return;
          }
          this[key]();
        };
      }
    });
  }

  // #endregion Protected Methods
}
