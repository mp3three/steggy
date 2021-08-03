import {
  ControllerSettings,
  RoomController,
  RoomDeviceDTO,
} from '@automagical/contracts';
import { ControllerStateDTO } from '@automagical/contracts/controller-logic';
import { domain, HASS_DOMAINS } from '@automagical/contracts/home-assistant';
import { HomeAssistantCoreService } from '@automagical/home-assistant';
import {
  CacheManagerService,
  Debug,
  InjectCache,
  Trace,
} from '@automagical/utilities';
import { Injectable, Scope } from '@nestjs/common';
import { each } from 'async';

export const LOADED_ROOMS = new Map<RoomController, RoomCoordinatorService>();
const CACHE_KEY = ({ controller }: { controller: RoomController }): string =>
  `COORDINATOR:${controller.name}`;

@Injectable({ scope: Scope.TRANSIENT })
export class RoomCoordinatorService {
  // #region Object Properties

  public controller: RoomController;
  public settings: ControllerSettings;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectCache() private readonly cache: CacheManagerService,
    private readonly hassCoreService: HomeAssistantCoreService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(
    count: number,
    controller: RoomController,
  ): Promise<void> {
    if (!(await controller.areaOff(count))) {
      return;
    }
    await this.passthrough(false, count);
  }

  @Trace()
  public async areaOn(
    count: number,
    controller: RoomController,
  ): Promise<void> {
    if (!(await controller.areaOn(count))) {
      return;
    }
    await this.passthrough(true, count);
  }

  public getState(): Promise<ControllerStateDTO> {
    return this.cache.get(CACHE_KEY(this));
  }

  public async setState(state: ControllerStateDTO): Promise<void> {
    await this.cache.set(CACHE_KEY(this), state);
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected async onApplicationBootstrap(): Promise<void> {
    LOADED_ROOMS.set(this.controller, this);
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Debug(`Set lighting passthrough`)
  private async passthrough(
    turnOn: boolean,
    count: number,
    recurse = true,
  ): Promise<void> {
    await each(
      this.settings.devices,
      async (device: RoomDeviceDTO, callback) => {
        // Filter out wrong results
        if (device.comboCount !== count) {
          callback();
          return;
        }
        const lights = device.target?.filter(
          (item) => domain(item) === HASS_DOMAINS.light,
        );
        await (turnOn
          ? this.circadianLight(lights, 100)
          : this.turnOff(lights));
        const switches = device.target?.filter(
          (item) => domain(item) !== HASS_DOMAINS.light,
        );
        await (turnOn
          ? this.hassCoreService.turnOn(switches)
          : this.hassCoreService.turnOff(switches));
        if (!recurse) {
          callback();
          return;
        }
        if (device.rooms) {
          await each(device.rooms, async (room, nestedCallback) => {
            if (typeof room === 'object') {
              if (
                (room.type === 'off' && turnOn === true) ||
                (room.type === 'on' && turnOn === false)
              ) {
                nestedCallback();
                return;
              }
              room = room.name;
            }
            const levels = Array.from({ length: count }).map(
              (item, index) => index + 1,
            );
            await Promise.all(
              levels.map(async (level) => {
                await this.passthrough(turnOn, level, false);
              }),
            );
            nestedCallback();
          });
        }
        callback();
      },
    );
  }

  // #endregion Private Methods
}
