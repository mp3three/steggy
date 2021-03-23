import {
  EntityService,
  HomeAssistantService,
  RoomCode,
  RoomService,
  TVRoom,
} from '@automagical/home-assistant';
import { forwardRef, Inject, Injectable } from '@nestjs/common';

@Injectable()
export class LivingService extends TVRoom {
  // #region Constructors

  constructor(
    @Inject(forwardRef(() => HomeAssistantService))
    homeAssistantService: HomeAssistantService,
    @Inject(forwardRef(() => RoomService))
    roomService: RoomService,
    @Inject(forwardRef(() => EntityService))
    entityService: EntityService,
  ) {
    super(RoomCode.living, {
      homeAssistantService,
      roomService,
      entityService,
    });
  }

  // #endregion Constructors
}
