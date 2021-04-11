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

@Injectable()
export class GuestService extends SceneRoom {
  // #region Constructors

  constructor(
    @Inject(GUEST_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
    @InjectPinoLogger(GuestService.name) protected readonly logger: PinoLogger,
    protected readonly homeAssistantService: HomeAssistantService,
    protected readonly entityService: EntityService,
    protected readonly roomService: RoomService,
  ) {
    super();
    roomService.ROOM_REGISTRY.guest = roomConfig;
  }

  // #endregion Constructors

  // #region Public Methods

  public doubleHigh(): Promise<void> {
    this.logger.debug('doubleHigh');
    return;
  }

  public doubleOff(): Promise<void> {
    this.logger.debug('doubleOff');
    return;
  }

  public async sceneSmart(): Promise<void> {
    this.logger.debug('sceneSmart');
    return this.roomService.smart(this.roomConfig);
  }

  // #endregion Public Methods
}
