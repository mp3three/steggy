import {
  ControllerStates,
  iRoomController,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { AutoLogService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { KunamiCodeService } from './kunami-code.service';
import { RemoteAdapterService } from './remote-adapter.service';

/**
 * This service searches through all the declared providers looking for rooms.
 * When one is found, secondary classes such as state management and lighting controllers are added.
 * Additionally, this service performs injection on specifically annotated properties
 */
@Injectable()
export class RoomExplorerService {
  // #region Object Properties

  public readonly rooms = new Set<InstanceWrapper<iRoomController>>();

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly logger: AutoLogService,
    private readonly discoveryService: DiscoveryService,
    private readonly remoteAdapter: RemoteAdapterService,
    private readonly kunamiCode: KunamiCodeService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public getSettings({ instance }: InstanceWrapper): RoomControllerSettingsDTO {
    const constructor = instance?.constructor ?? {};
    return constructor[ROOM_CONTROLLER_SETTINGS];
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onApplicationBootstrap(): void {
    const providers: InstanceWrapper<iRoomController>[] =
      this.discoveryService.getProviders();
    providers.forEach(async (wrapper) => {
      const settings = this.getSettings(wrapper);
      if (!settings) {
        return;
      }
      this.rooms.add(wrapper);
      const { instance } = wrapper;
      this.remoteAdapter.watch(settings.remote);
      this.controllerDefaults(settings, instance);
      this.logger.info(`[${settings.friendlyName}] initialized`);
    });
  }

  // #endregion Protected Methods

  // #region Private Methods

  private controllerDefaults(
    settings: RoomControllerSettingsDTO,
    instance: iRoomController,
  ): void {
    this.kunamiCode.addCommand({
      activate: {
        ignoreRelease: true,
        states: [ControllerStates.on, ControllerStates.on],
      },
      callback: () => {
        if (!instance.areaOn) {
          return;
        }
        instance.areaOn(2);
      },
    });
    this.kunamiCode.addCommand({
      activate: {
        ignoreRelease: true,
        states: [ControllerStates.off, ControllerStates.off],
      },
      callback: () => {
        if (!instance.areaOn) {
          return;
        }
        instance.areaOff(2);
      },
    });
    this.kunamiCode.addCommand({
      activate: {
        ignoreRelease: true,
        states: [ControllerStates.favorite, ControllerStates.favorite],
      },
      callback: () => {
        if (!instance.areaOn) {
          return;
        }
        instance.favorite(2);
      },
    });
  }

  // #endregion Private Methods
}
