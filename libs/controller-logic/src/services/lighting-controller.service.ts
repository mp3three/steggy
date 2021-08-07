import type { iRoomController } from '@automagical/contracts';
import {
  ControllerStates,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { HomeAssistantCoreService } from '@automagical/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable, Scope } from '@nestjs/common';
import { each } from 'async';
import { PinoLogger } from 'nestjs-pino';

import { LightManagerService } from './light-manager.service';
import { RemoteAdapterService } from './remote-adapter.service';

@Injectable({ scope: Scope.TRANSIENT })
export class LightingControllerService {
  // #region Object Properties

  public controller: Partial<iRoomController>;
  public settings: RoomControllerSettingsDTO;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger()
    private readonly logger: PinoLogger,
    private readonly hassCoreService: HomeAssistantCoreService,
    private readonly lightManager: LightManagerService,
    private readonly remoteAdapter: RemoteAdapterService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(accessories = false): Promise<void> {
    if (this.controller.areaOff) {
      const result = await this.controller.areaOff();
      if (result === false) {
        return;
      }
    }
    await this.lightManager.turnOff(this.settings.lights ?? []);
    await this.hassCoreService.turnOff(this.settings.switches ?? []);
    if (accessories) {
      await this.hassCoreService.turnOff(this.settings.accessories ?? []);
    }
  }

  @Trace()
  public async areaOn(accessories = false): Promise<void> {
    if (this.controller.areaOff) {
      const result = await this.controller.areaOff();
      if (result === false) {
        return;
      }
    }
    await this.circadianLight(this.settings.lights ?? []);
    await this.hassCoreService.turnOn(this.settings.switches ?? []);
    if (accessories) {
      await this.hassCoreService.turnOn(this.settings.accessories ?? []);
    }
  }

  @Trace()
  public async circadianLight(
    entity_id: string | string[],
    brightness?: number,
  ): Promise<void> {
    entity_id ??= [];
    if (Array.isArray(entity_id)) {
      await each(entity_id, async (id, callback) => {
        await this.circadianLight(id, brightness);
        callback();
      });
      return;
    }
    await this.lightManager.turnOn(entity_id, {
      brightness,
      mode: 'circadian',
    });
  }

  @Trace()
  public async dimDown(): Promise<void> {
    if (this.controller.dimDown && !(await this.controller.dimDown())) {
      return;
    }
    const lights = await this.findDimmableLights();
    await each(lights, async (entity_id: string, callback) => {
      await this.lightDim(entity_id, -10);
      callback();
    });
  }

  @Trace()
  public async dimUp(): Promise<void> {
    if (this.controller.dimUp && !(await this.controller.dimUp())) {
      return;
    }
    const lights = await this.findDimmableLights();
    await each(lights, async (entity_id: string, callback) => {
      await this.lightDim(entity_id, 10);
      callback();
    });
  }

  @Trace()
  public init(): void {
    if (this.settings?.remote) {
      this.remoteAdapter
        .watch(this.settings.remote)
        .subscribe(async (command) => {
          switch (command) {
            case ControllerStates.on:
              await this.areaOn();
              return;
            case ControllerStates.off:
              await this.areaOff();
              return;
            case ControllerStates.up:
              await this.dimUp();
              return;
            case ControllerStates.down:
              await this.dimDown();
              return;
          }
        });
    }
  }

  /**
   * Brightness (as controlled by the dimmer) must remain in the 5-100% range
   *
   * To go under 5, turn off the light instead
   */
  @Trace()
  public async lightDim(entityId: string, amount: number): Promise<void> {
    let { brightness } = await this.lightManager.getState(entityId);
    brightness += amount;
    if (brightness > 100) {
      brightness = 100;
    }
    if (brightness < 5) {
      brightness = 5;
    }
    this.logger.debug({ amount }, `${entityId} set brightness: ${brightness}%`);
    return await this.circadianLight(entityId, brightness);
  }

  // #endregion Public Methods

  // #region Private Methods

  @Trace()
  private async findDimmableLights(): Promise<string[]> {
    const lights = await this.lightManager.getActiveLights();
    return this.settings.lights.filter((light) => lights.includes(light));
  }

  // #endregion Private Methods
}
