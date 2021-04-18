import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Inject, Injectable } from '@nestjs/common';
import { GAMES_CONFIG } from '../../typings';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class GamesService extends SceneRoom {
  // #region Constructors

  constructor(
    protected readonly homeAssistantService: HomeAssistantService,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly entityService: EntityService,
    @InjectPinoLogger(GamesService.name) protected readonly logger: PinoLogger,
    protected readonly roomService: RoomService,
    @Inject(GAMES_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
  ) {
    super();
    roomService.ROOM_REGISTRY.games = roomConfig;
  }

  // #endregion Constructors
}
