import {
  HomeAssistantRoomConfigDTO,
  PicoStates,
  RoomScene,
} from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { BEDROOM_CONFIG } from '../../typings/config';

@Injectable()
export class BedroomService extends SceneRoom {
  // #region Constructors

  constructor(
    protected readonly homeAssistantService: HomeAssistantService,
    @InjectPinoLogger(BedroomService.name)
    protected readonly logger: PinoLogger,
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
  private async bedPicoCb(button: PicoStates) {
    this.logger.warn('bedPicoCb', button);
    switch (button) {
      case PicoStates.smart:
        return this.entityService.toggle(`switch.womp`);
      case PicoStates.low:
        return this.roomService.setFan(this.roomConfig.config.fan, 'down');
      case PicoStates.medium:
        return this.roomService.setFan(this.roomConfig.config.fan, 'up');
      case PicoStates.high:
        return this.roomService.setScene(RoomScene.high, this.roomConfig, true);
      case PicoStates.off:
        return this.roomService.setScene(RoomScene.off, this.roomConfig, true);
    }
  }

  @OnEvent(`sensor.bed_pico/double`)
  private async bedPicoDoubleCb(button: PicoStates) {
    this.logger.warn('bedPicoDoubleCb', button);
    switch (button) {
      case PicoStates.smart:
        return this.entityService.toggle(`switch.womp`);
      case PicoStates.low:
        return this.roomService.setFan(this.roomConfig.config.fan, 'down');
      case PicoStates.medium:
        return this.roomService.setFan(this.roomConfig.config.fan, 'up');
      case PicoStates.high:
        return this.roomService.smart(null, RoomScene.high);
      case PicoStates.off:
        return this.roomService.smart(null, RoomScene.low);
    }
  }

  // #endregion Private Methods
}
