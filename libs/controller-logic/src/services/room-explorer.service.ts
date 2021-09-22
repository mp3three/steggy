import {
  AutoLogService,
  InjectLogger,
  ModuleScannerService,
  MqttService,
  PEAT,
  SEND_ROOM_STATE,
  Trace,
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
import { RoomCommandDTO } from '../contracts/room-command.dto';
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
    private readonly mqtt: MqttService,
    private readonly scanner: ModuleScannerService,
    private readonly kunamiService: KunamiCodeService,
    private readonly lightManager: LightManagerService,
    private readonly roomManager: RoomManagerService,
  ) {}

  @Trace()
  protected onModuleInit(): void {
    const settings = this.scanner.findWithSymbol<
      RoomControllerSettingsDTO,
      iRoomController
    >(ROOM_CONTROLLER_SETTINGS);
    this.rooms = settings;
    settings.forEach((settings, instance) => {
      this.logger.info(`[${settings.friendlyName}] initializing`);
      this.remoteAdapter.watch(settings.remote);
      if (!settings.flags.has(RoomControllerFlags.SECONDARY)) {
        this.controllerDefaults(instance);
        this.roomToRoomEvents(settings, instance);
      }
    });
    this.logger.info(`Done`);
  }

  private controllerDefaults(instance: iRoomController): void {
    const list = [
      [ControllerStates.off, 'areaOff'],
      [ControllerStates.on, 'areaOn'],
      [ControllerStates.down, 'dimDown'],
      [ControllerStates.up, 'dimUp'],
    ] as [ControllerStates, keyof LightManagerService][];
    Steps(2).forEach((step, count) => {
      count++;
      list.forEach(([state, method]) => {
        this.kunamiService.addCommand(instance, {
          activate: {
            ignoreRelease: true,
            states: PEAT(count).map(() => state),
          },
          callback: () => {
            // this.lightManager.on
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
      this.mqtt.subscribe(SEND_ROOM_STATE(settings.name, event), callback);
      this.eventEmitter.on(ROOM_COMMAND(settings.name, event), callback);
    });
  }
}
