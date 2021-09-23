import {
  AutoLogService,
  Info,
  InjectLogger,
  ModuleScannerService,
  PEAT,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from 'eventemitter2';

import { RoomSettings, Steps } from '..';
import {
  ControllerStates,
  iRoomController,
  iRoomControllerMethods,
  ROOM_COMMAND,
  ROOM_CONTROLLER_SETTINGS,
  RoomControllerFlags,
  RoomControllerSettingsDTO,
} from '../contracts';
import {
  RoomCommandDTO,
  RoomCommandScope,
} from '../contracts/room-command.dto';
import { KunamiCodeService } from './kunami-code.service';
import { LightManagerService } from './light-manager.service';
import { RemoteAdapterService } from './remote-adapter.service';
import { RoomManagerService } from './room-manager.service';

/**
 * This service searches through all the declared providers looking for rooms.
 * When one is found, secondary classes such as state management and lighting controllers are added.
 * Additionally, this service performs injection on specifically annotated properties
 */
@Injectable()
export class RoomExplorerService {
  public rooms: Map<iRoomController, RoomControllerSettingsDTO>;

  constructor(
    @InjectLogger()
    private readonly logger: AutoLogService,
    private readonly remoteAdapter: RemoteAdapterService,
    private readonly eventEmitter: EventEmitter2,
    private readonly scanner: ModuleScannerService,
    private readonly kunamiService: KunamiCodeService,
    private readonly lightManager: LightManagerService,
    private readonly roomManager: RoomManagerService,
  ) {}

  @Info({ after: `[Controller Logic] initialized` })
  protected onModuleInit(): void {
    const settings = this.scanner.findWithSymbol<
      RoomControllerSettingsDTO,
      iRoomController
    >(ROOM_CONTROLLER_SETTINGS);
    this.rooms = settings;
    settings.forEach((settings, instance) => {
      this.initRoom(settings, instance);
    });
  }

  private initRoom(settings: RoomControllerSettingsDTO, instance): void {
    this.remoteAdapter.watch(settings.remote);
    if (!settings.flags.includes(RoomControllerFlags.SECONDARY)) {
      this.controllerDefaults(instance);
      this.roomToRoomEvents(settings, instance);
    }
    this.logger.info(`[${settings.friendlyName}] initialized`);
  }

  private controllerDefaults(instance: iRoomController): void {
    const settings = RoomSettings(instance);
    const list = [
      [ControllerStates.off, 'areaOff'],
      [ControllerStates.on, 'areaOn'],
      [ControllerStates.down, 'dimDown'],
      [ControllerStates.up, 'dimUp'],
    ];
    Steps(2).forEach((scope, count) => {
      count++;
      list.forEach(([state, method]) => {
        this.kunamiService.addCommand(instance, {
          activate: {
            ignoreRelease: true,
            states: PEAT(count).map(() => state as ControllerStates),
          },
          callback: async () => {
            this.logger.info(`${settings.friendlyName} ${method} (${count})`);
            switch (method) {
              case 'areaOn':
                await this.roomManager.areaOn(settings, {
                  scope,
                });
                break;
              case 'areaOff':
                await this.roomManager.areaOff(settings, {
                  scope,
                });
                break;
              case 'dimDown':
                await this.lightManager.dimDown(
                  { scope: RoomCommandScope.LOCAL },
                  settings.lights,
                );
                break;
              case 'dimUp':
                await this.lightManager.dimUp(
                  { scope: RoomCommandScope.LOCAL },
                  settings.lights,
                );
                break;
            }
          },
          name: `Quick ${method} (${count})`,
        });
      });
    });
  }

  private roomToRoomEvents(
    settings: RoomControllerSettingsDTO,
    instance: iRoomController,
  ): void {
    const { lights } = RoomSettings(instance);
    const mappings = new Map<
      keyof iRoomControllerMethods,
      (parameters: RoomCommandDTO) => void
    >([
      [
        'areaOn',
        (parameters: RoomCommandDTO) =>
          this.roomManager.areaOn(settings, parameters),
      ],
      [
        'areaOff',
        (parameters: RoomCommandDTO) =>
          this.roomManager.areaOff(settings, parameters),
      ],
      [
        'dimUp',
        (parameters: RoomCommandDTO) =>
          this.lightManager.dimUp(parameters, lights),
      ],
      [
        'dimDown',
        (parameters: RoomCommandDTO) =>
          this.lightManager.dimDown(parameters, lights),
      ],
      [
        'favorite',
        (parameters: RoomCommandDTO) =>
          instance.favorite ? instance.favorite(parameters) : undefined,
      ],
    ]);
    mappings.forEach((callback, event) => {
      this.eventEmitter.on(ROOM_COMMAND(settings.name, event), callback);
    });
  }
}
