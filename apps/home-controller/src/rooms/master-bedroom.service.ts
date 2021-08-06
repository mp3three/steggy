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

import { ROOM_NAMES } from '../typings';

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
  switches: ['switch.womp'],
})
export class MasterBedroomService implements Partial<iRoomController> {
  // #region Constructors

  constructor(
    private readonly lightingController: LightingControllerService,
    private readonly switchService: SwitchDomainService,
    private readonly lightService: LightDomainService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async favorite(count: number): Promise<boolean> {
    if (count === 1) {
      await this.switchService.turnOff('switch.womp');
      await this.lightService.turnOff([
        'light.bedroom_fan_top_left',
        'light.bedroom_fan_top_right',
        'light.bedroom_fan_bottom_left',
        'light.bedroom_fan_bottom_right',
      ]);
      await this.lightingController.circadianLight(['light.speaker_light'], 40);
    }
    if (count === 2) {
      await this.lightingController.roomOff([
        ROOM_NAMES.loft,
        ROOM_NAMES.downstairs,
        ROOM_NAMES.games,
      ]);
    }
    return false;
  }

  // #endregion Public Methods
}
