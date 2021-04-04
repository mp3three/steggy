import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import {
  HomeAssistantService,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { Inject, Injectable } from '@nestjs/common';
import { GAMES_CONFIG } from '../../typings';

@Injectable()
export class GamesService extends SceneRoom {
  // #region Object Properties

  protected readonly logger = Logger(GamesService);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    protected readonly homeAssistantService: HomeAssistantService,
    protected readonly roomService: RoomService,
    @Inject(GAMES_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
  ) {
    super();
    roomService.ROOM_REGISTRY.games = roomConfig;
  }

  // #endregion Constructors
}
