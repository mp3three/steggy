import {
  EntityService,
  HomeAssistantService,
  RoomCode,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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
    @Inject(forwardRef(() => HomeAssistantService))
    homeAssistantService: HomeAssistantService,
    @Inject(forwardRef(() => RoomService))
    roomService: RoomService,
    @Inject(forwardRef(() => EntityService))
    entityService: EntityService,
    protected readonly configService: ConfigService,
  ) {
    super(RoomCode.guest, {
      homeAssistantService,
      roomService,
      entityService,
      configService,
    });
  }

  // #endregion Constructors
}
