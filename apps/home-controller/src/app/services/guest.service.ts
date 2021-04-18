import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Inject, Injectable } from '@nestjs/common';
import { GUEST_CONFIG } from '../../typings';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class GuestService extends SceneRoom {
  // #region Constructors

  constructor(
    @Inject(GUEST_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
    @InjectPinoLogger(GuestService.name) protected readonly logger: PinoLogger,
    protected readonly homeAssistantService: HomeAssistantService,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly entityService: EntityService,
    protected readonly roomService: RoomService,
  ) {
    super();
    roomService.ROOM_REGISTRY.guest = roomConfig;
  }

  // #endregion Constructors
}
