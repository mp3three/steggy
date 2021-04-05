import {
  HomeAssistantRoomConfigDTO,
  PicoButtons,
  RoomScene,
} from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { Logger } from '@automagical/logger';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { BEDROOM_CONFIG } from '../../typings/config';

@Injectable()
export class BedroomService extends SceneRoom {
  // #region Object Properties

  protected readonly logger = Logger(BedroomService);

  // #endregion Object Properties

  // #region Constructors

  constructor(
    protected readonly homeAssistantService: HomeAssistantService,
    protected readonly roomService: RoomService,
    protected readonly entityService: EntityService,
    private readonly configService: ConfigService,
    @Inject(BEDROOM_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
  ) {
    super();
    roomService.ROOM_REGISTRY.bedroom = roomConfig;
  }

  // #endregion Constructors

  // #region Private Methods

  @Cron('0 40 8 * * Mon,Tue,Wed,Thu,Fri')
  private wakeupLightAlarm() {
    this.logger.debug('wakeupLightAlarm');
    return this.roomService.setScene(RoomScene.high, this.roomConfig, true);
  }

  @OnEvent(`sensor.bed_pico/single`)
  private async bedPicoCb(button: PicoButtons) {
    this.logger.debug('bedPicoCb');
    switch (button) {
      case PicoButtons.high:
        return this.roomService.setScene(RoomScene.high, this.roomConfig, true);
      case PicoButtons.off:
        return this.roomService.setScene(RoomScene.off, this.roomConfig, true);
      case PicoButtons.favorite:
        return this.entityService.toggle(`switch.womp`);
      case PicoButtons.low:
        return this.roomService.setFan(this.roomConfig.config.fan, 'down');
      case PicoButtons.medium:
        return this.roomService.setFan(this.roomConfig.config.fan, 'up');
    }
  }

  // #endregion Private Methods
}
