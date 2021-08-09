import { iRoomController } from '@automagical/contracts';
import {
  ControllerStates,
  LIGHTING_CONTROLLER,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { AutoLogService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { KunamiCodeService } from './kunami-code.service';
import { LightingControllerService } from './lighting-controller.service';

/**
 * This service searches through all the declared providers looking for rooms.
 * When one is found, secondary classes such as state management and lighting controllers are added.
 * Additionally, this service performs injection on specifically annotated properties
 */
@Injectable()
export class RoomExplorerService {
  // #region Object Properties

  public readonly rooms = new Set<InstanceWrapper>();

  private readonly injector = new Injector();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly logger: AutoLogService,
    private readonly discoveryService: DiscoveryService,
    private readonly kunamiCode: KunamiCodeService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public getController({
    instance,
  }: InstanceWrapper): LightingControllerService {
    return instance[LIGHTING_CONTROLLER];
  }

  public getSettings({ instance }: InstanceWrapper): RoomControllerSettingsDTO {
    const constructor = instance?.constructor ?? {};
    return constructor[ROOM_CONTROLLER_SETTINGS];
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onApplicationBootstrap(): void {
    const providers: InstanceWrapper<Partial<iRoomController>>[] =
      this.discoveryService.getProviders();
    providers.forEach(async (wrapper) => {
      const settings = this.getSettings(wrapper);
      if (!settings) {
        return;
      }
      this.logger.info(`Loading RoomController [${settings.friendlyName}]`);
      this.rooms.add(wrapper);
      const { instance } = wrapper;

      this.kunamiCode.addMatch(
        settings.remote,
        new Map([
          [
            [
              ControllerStates.on,
              ControllerStates.none,
              ControllerStates.on,
              ControllerStates.none,
            ],
            () => {
              if (!instance.areaOn) {
                return;
              }
              instance.areaOn(2);
            },
          ],
          [
            [
              ControllerStates.off,
              ControllerStates.none,
              ControllerStates.off,
              ControllerStates.none,
            ],
            () => {
              if (!instance.areaOn) {
                return;
              }
              instance.areaOff(2);
            },
          ],
          [
            [
              ControllerStates.favorite,
              ControllerStates.none,
              ControllerStates.favorite,
              ControllerStates.none,
            ],
            () => {
              if (!instance.areaOn) {
                return;
              }
              instance.favorite(2);
            },
          ],
        ]),
      );
    });
  }

  // #endregion Protected Methods
}
