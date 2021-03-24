import {
  EntityService,
  HomeAssistantService,
  RoomCode,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class GamesService extends SceneRoom {
  // #region Constructors

  constructor(
    @Inject(forwardRef(() => HomeAssistantService))
    homeAssistantService: HomeAssistantService,
    @Inject(forwardRef(() => RoomService))
    roomService: RoomService,
    @Inject(forwardRef(() => EntityService))
    entityService: EntityService,
  ) {
    super(RoomCode.games, {
      homeAssistantService,
      roomService,
      entityService,
    });
  }

  // #endregion Constructors
}
