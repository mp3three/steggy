import {
  COMMAND_SCOPE,
  ControllerStates,
  iRoomController,
  ROOM_COMMAND,
  RoomCommandDTO,
  RoomCommandScope,
  Steps,
} from '@automagical/controller-logic';
import {
  KunamiCodeService,
  LightManagerService,
  RoomController,
} from '@automagical/controller-logic';
import {
  LightDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { PEAT, SolarCalcService, Trace } from '@automagical/utilities';
import { EventEmitter2 } from 'eventemitter2';

import { GLOBAL_TRANSITION } from '../typings';

@RoomController({
  fan: 'fan.master_bedroom_ceiling_fan',
  friendlyName: 'Master Bedroom',
  lights: [
    'light.bedroom_fan_top_left',
    'light.bedroom_fan_top_right',
    'light.bedroom_fan_bottom_left',
    'light.bedroom_fan_bottom_right',
    'light.speaker_light',
  ],
  name: 'master',
  remote: 'sensor.bedroom_pico',
  switches: ['switch.womp'],
})
export class MasterBedroomController implements iRoomController {
  constructor(
    public readonly lightManager: LightManagerService,
    public readonly kunamiService: KunamiCodeService,
    private readonly switchService: SwitchDomainService,
    private readonly lightService: LightDomainService,
    private readonly eventEmitter: EventEmitter2,
    private readonly solarCalc: SolarCalcService,
  ) {}

  @Trace()
  public areaOff(parameters: RoomCommandDTO): void {
    const scope = COMMAND_SCOPE(parameters);
    if (scope.has(RoomCommandScope.BROADCAST)) {
      ['games', 'loft', 'downstairs'].forEach((room) =>
        this.eventEmitter.emit(ROOM_COMMAND(room, 'areaOff'), parameters),
      );
      this.eventEmitter.emit(GLOBAL_TRANSITION);
    }
  }

  @Trace()
  public areaOn(parameters: RoomCommandDTO): void {
    const scope = COMMAND_SCOPE(parameters);
    if (scope.has(RoomCommandScope.BROADCAST)) {
      ['games', 'loft', 'downstairs'].forEach((room) =>
        this.eventEmitter.emit(ROOM_COMMAND(room, 'areaOn'), parameters),
      );
      this.eventEmitter.emit(GLOBAL_TRANSITION);
    }
  }

  @Trace()
  public async favorite(parameters: RoomCommandDTO): Promise<void> {
    const scope = COMMAND_SCOPE(parameters);
    if (scope.has(RoomCommandScope.LOCAL)) {
      let brightness = 100;
      if (this.solarCalc.IS_EVENING) {
        await this.switchService.turnOff('switch.womp');
        brightness = 40;
      } else {
        await this.switchService.turnOn('switch.womp');
      }
      await this.lightService.turnOff([
        'light.bedroom_fan_top_left',
        'light.bedroom_fan_top_right',
        'light.bedroom_fan_bottom_left',
        'light.bedroom_fan_bottom_right',
      ]);
      await this.lightManager.circadianLight(
        ['light.speaker_light'],
        brightness,
      );
      return;
    }
    if (scope.has(RoomCommandScope.ACCESSORIES)) {
      ['games', 'loft', 'downstairs'].forEach((room) =>
        this.eventEmitter.emit(ROOM_COMMAND(room, 'areaOff'), parameters),
      );
      this.eventEmitter.emit(GLOBAL_TRANSITION);
    }
  }

  @Trace()
  protected onModuleInit(): void {
    Steps(2).forEach((scope, count) => {
      this.kunamiService.addCommand({
        activate: {
          ignoreRelease: true,
          states: PEAT(count + 1, ControllerStates.favorite),
        },
        callback: async () => {
          await this.favorite({ scope });
        },
        name: `Favorite (${count + 1})`,
      });
    });
    this.kunamiService.addCommand({
      activate: {
        ignoreRelease: true,
        states: PEAT(3, ControllerStates.off),
      },
      callback: async () => {
        await this.areaOff({ scope: RoomCommandScope.BROADCAST });
      },
      name: `areaOff (3)`,
    });
    this.kunamiService.addCommand({
      activate: {
        ignoreRelease: true,
        states: PEAT(3, ControllerStates.on),
      },
      callback: async () => {
        await this.areaOn({ scope: RoomCommandScope.BROADCAST });
      },
      name: `areaOn (3)`,
    });
  }
}
