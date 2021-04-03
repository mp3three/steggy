import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import { RoomService, SceneRoom } from '@automagical/home-assistant';
import { Inject, Injectable } from '@nestjs/common';
import { GAMES_CONFIG } from '../../typings';

@Injectable()
export class GamesService extends SceneRoom {
  // #region Constructors

  constructor(
    protected readonly roomService: RoomService,
    @Inject(GAMES_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
  ) {
    super();
  }

  // #endregion Constructors
}
