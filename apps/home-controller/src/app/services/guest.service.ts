import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import {
  HomeAssistantService,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { Inject, Injectable } from '@nestjs/common';
import { GUEST_CONFIG } from '../../typings';

@Injectable()
export class GuestService extends SceneRoom {
  // #region Object Properties

  protected readonly logger = Logger(GuestService);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @Inject(GUEST_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
    protected readonly homeAssistantService: HomeAssistantService,
    protected readonly roomService: RoomService,
  ) {
    super();
    roomService.ROOM_REGISTRY.guest = roomConfig;
  }

  // #endregion Constructors

  // #region Protected Methods

  protected doubleHigh(): Promise<void> {
    return;
  }

  protected doubleOff(): Promise<void> {
    return;
  }

  protected async sceneSmart(): Promise<void> {
    return this.roomService.smart(this.roomConfig);
  }

  // #endregion Protected Methods
}
