import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import { RoomService, SceneRoom } from '@automagical/home-assistant';
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
    protected readonly roomService: RoomService,
  ) {
    super();
    roomService.ROOM_REGISTRY.guest = roomConfig;
  }

  // #endregion Constructors
}
