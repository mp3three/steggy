import { RouteInjector } from '@automagical/server';
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
import { LightManagerService } from './light-manager.service';
import { RemoteAdapterService } from './remote-adapter.service';

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
    private readonly routeInjector: RouteInjector,
  ) {}

  @Trace()
  protected onPreInit(): void {
    // const map = this.scanner.findWithSymbol<CommandOptions, iRoomController>(
    //   ROOM_API_COMMAND,
    // );
    // map.forEach((options, instance) => {
    //   const proto = instance.constructor.prototype;
    //   proto.areaOn ??= () => {
    //     instance.lightManager.areaOn({ count: 2 });
    //   };
    //   proto.areaOff ??= () => {
    //     instance.lightManager.areaOff({ count: 2 });
    //   };
    //   const descriptors = Object.getOwnPropertyDescriptors(proto);
    //   Reflect.defineMetadata('path', '/areaOn', descriptors.areaOn.value);
    //   Reflect.defineMetadata(
    //     'method',
    //     RequestMethod.GET,
    //     descriptors.areaOn.value,
    //   );
    //   this.logger.info({ options });
    // });

    const settings = this.scanner.findWithSymbol<
      RoomControllerSettingsDTO,
      iRoomController
    >(ROOM_CONTROLLER_SETTINGS);
    settings.forEach((settings, instance) => {
      this.attachRoutes(instance);
    });
  }

  private attachRoutes(instance: iRoomController): void {
    this.routeInjector.inject<iRoomController>({
      callback() {
        instance.lightManager.areaOn({
          scope: [RoomCommandScope.LOCAL, RoomCommandScope.ACCESSORIES],
        });
      },
      instance,
      method: 'put',
      name: 'areaOn',
    });
    this.routeInjector.inject<iRoomController>({
      callback() {
        instance.lightManager.areaOff({
          scope: [RoomCommandScope.LOCAL, RoomCommandScope.ACCESSORIES],
        });
      },
      instance,
      method: 'put',
      name: 'areaOff',
    });
    this.routeInjector.inject<iRoomController>({
      instance,
      method: 'put',
      name: 'favorite',
    });
    this.routeInjector.inject<iRoomController>({
      callback() {
        instance.lightManager.dimUp({});
      },
      instance,
      method: 'put',
      name: 'dimUp',
    });
    this.routeInjector.inject<iRoomController>({
      callback() {
        instance.lightManager.dimDown({});
      },
      instance,
      method: 'put',
      name: 'dimDown',
    });
  }

  @Trace()
  protected onModuleInit(): void {
    const settings = this.scanner.findWithSymbol<
      RoomControllerSettingsDTO,
      iRoomController
    >(ROOM_CONTROLLER_SETTINGS);
    this.rooms = settings;
    settings.forEach((settings, instance) => {
      instance.lightManager['room'] = instance;
      instance.kunamiService['room'] = instance;
      this.remoteAdapter.watch(settings.remote);
      if (!settings.flags.has(RoomControllerFlags.SECONDARY)) {
        this.controllerDefaults(instance);
        this.roomToRoomEvents(settings, instance);
      }
      this.logger.info(`[${settings.friendlyName}] initialized`);
    });
  }

  private controllerDefaults(instance: iRoomController): void {
    const list = [
      [ControllerStates.off, 'areaOff'],
      [ControllerStates.on, 'areaOn'],
      [ControllerStates.down, 'dimDown'],
      [ControllerStates.up, 'dimUp'],
    ] as [ControllerStates, keyof LightManagerService][];
    PEAT(2).forEach((count) => {
      list.forEach(([state, method]) => {
        instance.kunamiService.addCommand({
          activate: {
            ignoreRelease: true,
            states: PEAT(count).map(() => state),
          },
          callback: () => {
            instance.lightManager[method]({ count });
          },
          name: `Quick ${method} (${count})`,
        });
      });
    });
  }

  private roomToRoomEvents(
    { name }: RoomControllerSettingsDTO,
    instance: iRoomController,
  ): void {
    const mappings = new Map<
      keyof iRoomControllerMethods,
      (parameters: RoomCommandDTO) => void
    >([
      [
        'areaOn',
        (parameters: RoomCommandDTO) =>
          instance.lightManager.areaOn(parameters),
      ],
      [
        'areaOff',
        (parameters: RoomCommandDTO) =>
          instance.lightManager.areaOff(parameters),
      ],
      [
        'dimUp',
        (parameters: RoomCommandDTO) => instance.lightManager.dimUp(parameters),
      ],
      [
        'dimDown',
        (parameters: RoomCommandDTO) =>
          instance.lightManager.dimDown(parameters),
      ],
      [
        'favorite',
        (parameters: RoomCommandDTO) =>
          instance.favorite ? instance.favorite(parameters) : undefined,
      ],
    ]);
    mappings.forEach((callback, event) => {
      this.logger.debug({
        event: ROOM_COMMAND(name, event),
        mqtt: SEND_ROOM_STATE(name, event),
      });
      this.mqtt.subscribe(SEND_ROOM_STATE(name, event), callback);
      this.eventEmitter.on(ROOM_COMMAND(name, event), callback);
    });
  }
}
