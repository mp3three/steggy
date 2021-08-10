import {
  ControllerStates,
  iRoomController,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerSettingsDTO,
} from '@automagical/contracts/controller-logic';
import { AutoLogService, InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { DiscoveryService } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';

import { KunamiCodeService } from './kunami-code.service';
import { LightManagerService } from './light-manager.service';
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
    @InjectLogger()
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
  protected onModuleInit(): void {
    const providers: InstanceWrapper<iRoomController>[] =
      this.discoveryService.getProviders();
    providers.forEach(async (wrapper) => {
      const settings = this.getSettings(wrapper);
      if (!settings) {
        return;
      }
      this.rooms.add(wrapper);
      const { instance } = wrapper;
      instance.lightManager['bind'](instance);
      instance.kunamiService['room'] = instance;
      this.remoteAdapter.watch(settings.remote);
      this.controllerDefaults(instance);
      this.logger.info(`[${settings.friendlyName}] initialized`);
    });
  }

  // #endregion Protected Methods

  // #region Private Methods

  private controllerDefaults(instance: iRoomController): void {
    const list = [
      [ControllerStates.off, 'areaOff'],
      [ControllerStates.on, 'areaOn'],
    ] as [ControllerStates, keyof LightManagerService][];
    Array.from({ length: 2 }).forEach((item, index) => {
      list.forEach(([state, method]) => {
        instance.kunamiService.addCommand({
          activate: {
            ignoreRelease: true,
            states: Array.from({ length: index + 1 }).map(() => state),
          },
          callback: () => {
            instance.lightManager[method]({ count: index + 1 });
          },
          name: `Quick ${method}`,
        });
      });
    });
  }

  // #endregion Private Methods
}
