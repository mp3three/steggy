import {
  COMMAND_SCOPE,
  ControllerStates,
  iRoomController,
  KunamiCodeService,
  LightManagerService,
  RoomCommandDTO,
  RoomCommandScope,
  RoomController,
  Steps,
} from '@automagical/controller-logic';
import {
  LightDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { PEAT, SolarCalcService, Trace } from '@automagical/utilities';

import { RelayCommand } from '../decorators';

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
    private readonly lightManager: LightManagerService,
    private readonly kunamiService: KunamiCodeService,
    private readonly switchService: SwitchDomainService,
    private readonly lightService: LightDomainService,
    private readonly solarCalc: SolarCalcService,
  ) {}

  @Trace()
  @RelayCommand(['games', 'loft', 'downstairs'], 'areaOff')
  public async favorite(parameters: RoomCommandDTO): Promise<boolean> {
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
    return scope.has(RoomCommandScope.ACCESSORIES);
  }

  @Trace()
  protected onModuleInit(): void {
    Steps(2).forEach((scope, count) => {
      this.kunamiService.addCommand(this, {
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
  }
}
