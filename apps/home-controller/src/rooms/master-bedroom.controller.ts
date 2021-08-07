import { iRoomController } from '@automagical/contracts';
import {
  LightingControllerService,
  RoomController,
} from '@automagical/controller-logic';
import {
  LightDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
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
export class MasterBedroomController implements Partial<iRoomController> {
  // #region Constructors

  constructor(
    private readonly lightingController: LightingControllerService,
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
    await this.lightingController.circadianLight(['light.speaker_light'], 40);
    return false;
  }

  // #endregion Public Methods
}
