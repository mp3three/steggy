import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import { RoomService, SceneRoom } from '@automagical/home-assistant';
import { Inject, Injectable } from '@nestjs/common';
import { LIVING_ROOM_CONFIG } from '../../typings';

@Injectable()
export class LivingService extends SceneRoom {
  // #region Constructors

  constructor(
    protected readonly roomService: RoomService,
    @Inject(LIVING_ROOM_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
  ) {
    super();
  }

  // #endregion Constructors
}
