import {
  LIGHTING_CONTROLLER,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { AutoLogService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

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

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly logger: AutoLogService,
    private readonly discoveryService: DiscoveryService,
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
    const providers: InstanceWrapper[] = this.discoveryService.getProviders();
    providers.forEach(async (wrapper) => {
      const settings = this.getSettings(wrapper);
      if (!settings) {
        return;
      }
      this.logger.info(`Loading RoomController [${settings.friendlyName}]`);
      this.rooms.add(wrapper);
    });
  }

  // #endregion Protected Methods
}
