import { iRoomController } from '@automagical/contracts/controller-logic';
import {
  KunamiCodeService,
  LightManagerService,
  RoomController,
} from '@automagical/controller-logic';
import {
  LightDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { Trace } from '@automagical/utilities';

@RoomController({
  friendlyName: 'Master Bedroom',
  lights: [
    'light.bedroom_fan_top_left',
    'light.bedroom_fan_top_right',
    'light.bedroom_fan_bottom_left',
    'light.bedroom_fan_bottom_right',
  ],
  name: 'master',
  remote: 'sensor.bedroom_pico',
  switches: ['switch.womp'],
})
export class MasterBedroomController implements iRoomController {
  // #region Constructors

  constructor(
    public readonly lightManager: LightManagerService,
    public readonly kunamiService: KunamiCodeService,
    private readonly switchService: SwitchDomainService,
    private readonly lightService: LightDomainService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async favorite(): Promise<boolean> {
    await this.switchService.turnOff('switch.womp');
    await this.lightService.turnOff([
      'light.bedroom_fan_top_left',
      'light.bedroom_fan_top_right',
      'light.bedroom_fan_bottom_left',
      'light.bedroom_fan_bottom_right',
    ]);
    await this.lightManager.circadianLight(['light.speaker_light'], 40);
    return false;
  }

  // #endregion Public Methods
}
