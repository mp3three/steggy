import {
  ControllerStates,
  iRoomController,
  ROOM_COMMAND,
  RoomControllerParametersDTO,
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
  public areaOff({ count }: RoomControllerParametersDTO): void {
    if (count === 3) {
      ['games', 'loft', 'downstairs'].forEach((room) =>
        this.eventEmitter.emit(ROOM_COMMAND(room, 'areaOff'), { count }),
      );
      this.eventEmitter.emit(GLOBAL_TRANSITION);
    }
  }

  @Trace()
  public areaOn({ count }: RoomControllerParametersDTO): void {
    if (count === 3) {
      ['games', 'loft', 'downstairs'].forEach((room) =>
        this.eventEmitter.emit(ROOM_COMMAND(room, 'areaOn'), { count }),
      );
      this.eventEmitter.emit(GLOBAL_TRANSITION);
    }
  }

  @Trace()
  public async favorite({ count }: RoomControllerParametersDTO): Promise<void> {
    if (count === 1) {
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
    if (count === 2) {
      ['games', 'loft', 'downstairs'].forEach((room) =>
        this.eventEmitter.emit(ROOM_COMMAND(room, 'areaOff'), { count }),
      );
      this.eventEmitter.emit(GLOBAL_TRANSITION);
    }
  }

  @Trace()
  protected onModuleInit(): void {
    PEAT(2).forEach((count) => {
      this.kunamiService.addCommand({
        activate: {
          ignoreRelease: true,
          states: PEAT(count, ControllerStates.favorite),
        },
        callback: async () => {
          await this.favorite({ count });
        },
        name: `Favorite (${count})`,
      });
    });
    this.kunamiService.addCommand({
      activate: {
        ignoreRelease: true,
        states: PEAT(3, ControllerStates.off),
      },
      callback: async () => {
        await this.areaOff({ count: 3 });
      },
      name: `areaOff (3)`,
    });
    this.kunamiService.addCommand({
      activate: {
        ignoreRelease: true,
        states: PEAT(3, ControllerStates.on),
      },
      callback: async () => {
        await this.areaOn({ count: 3 });
      },
      name: `areaOn (3)`,
    });
  }
}
