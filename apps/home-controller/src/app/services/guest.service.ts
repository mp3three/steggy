import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import { RoomService, SceneRoom } from '@automagical/home-assistant';
import { Inject, Injectable } from '@nestjs/common';
import { GUEST_CONFIG } from '../../typings';

@Injectable()
export class GuestService extends SceneRoom {
  // #region Object Properties

  protected circadian = {
    low: 'switch.circadian_lighting_guest_low_brightness_circadian_light',
    high: 'switch.circadian_lighting_guest_circadian_light',
  };

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(GUEST_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
    protected readonly roomService: RoomService,
  ) {
    super();
  }

  // #endregion Constructors
}
