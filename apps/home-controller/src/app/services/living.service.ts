import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { InjectLogger } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';
import { LIVING_ROOM_CONFIG } from '../../typings';

@Injectable()
export class LivingService extends SceneRoom {
  // #region Constructors

  constructor(
    protected readonly homeAssistantService: HomeAssistantService,
    @InjectLogger(LivingService, APP_HOME_CONTROLLER)
    protected readonly logger: PinoLogger,
    protected readonly entityService: EntityService,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly roomService: RoomService,
    @Inject(LIVING_ROOM_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
  ) {
    super();
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
