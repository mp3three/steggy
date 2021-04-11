import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { LIVING_ROOM_CONFIG } from '../../typings';

@Injectable()
export class LivingService extends SceneRoom {
  // #region Constructors

  constructor(
    protected readonly homeAssistantService: HomeAssistantService,
    @InjectPinoLogger(LivingService.name) protected readonly logger: PinoLogger,
    protected readonly entityService: EntityService,
    protected readonly roomService: RoomService,
    @Inject(LIVING_ROOM_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
  ) {
    super();
    roomService.ROOM_REGISTRY.living_room = roomConfig;
  }

  // #endregion Constructors

  // #region Private Methods

  @OnEvent('living_room/off')
  @OnEvent('living/off')
  private screenOff() {
    this.logger.debug('screenOff');
    // return this.roomService.setRoku(
    //   RokuInputs.off,
    //   this.roomConfig.config.roku,
    // );
  }

  // #endregion Private Methods
}
