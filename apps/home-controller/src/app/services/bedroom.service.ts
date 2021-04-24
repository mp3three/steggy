import {
  APP_HOME_CONTROLLER,
  GLOBAL_OFF,
  GLOBAL_ON,
  HA_RAW_EVENT,
} from '@automagical/contracts/constants';
import {
  HassEventDTO,
  HassEvents,
  HomeAssistantRoomConfigDTO,
  PicoStates,
} from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { InjectLogger } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';
import { BEDROOM_CONFIG } from '../../typings/config';

@Injectable()
export class BedroomService extends SceneRoom {
  // #region Constructors

  constructor(
    @InjectLogger(BedroomService, APP_HOME_CONTROLLER)
    protected readonly logger: PinoLogger,
    @Inject(BEDROOM_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
    protected readonly homeAssistantService: HomeAssistantService,
    protected readonly roomService: RoomService,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly entityService: EntityService,
    private readonly configService: ConfigService,
  ) {
    super();
    roomService.ROOM_REGISTRY.bedroom = roomConfig;
  }

  // #endregion Constructors

  // #region Private Methods

  @Cron('0 40 8 * * Mon,Tue,Wed,Thu,Fri')
  private wakeupLightAlarm() {
    this.logger.debug('wakeupLightAlarm');
    return this.setFavoriteScene();
  }

  @OnEvent([HA_RAW_EVENT])
  private async bedPicoCb(event: HassEventDTO): Promise<void> {
    if (event.event_type !== HassEvents.state_changed) {
      return;
    }
    if (event.data.entity_id !== this.roomConfig?.config?.pico) {
      return;
    }
    const button = event.data.new_state.state as PicoStates;
    this.logger.warn('bedPicoCb', button);
    switch (button) {
      case PicoStates.favorite:
        this.entityService.toggle(`switch.womp`);
        return;
      case PicoStates.low:
        this.roomService.setFan(this.roomConfig.config.fan, 'down');
        return;
      case PicoStates.medium:
        this.roomService.setFan(this.roomConfig.config.fan, 'up');
        return;
      case PicoStates.high:
        this.eventEmitter.emit(GLOBAL_ON);
        return;
      case PicoStates.off:
        this.eventEmitter.emit(GLOBAL_OFF);
        return;
    }
  }

  // #endregion Private Methods
}
