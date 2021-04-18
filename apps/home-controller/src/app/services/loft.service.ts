import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  RoomService,
  SceneRoom,
} from '@automagical/home-assistant';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { LOFT_CONFIG } from '../../typings';

enum RokuInputs {
  off = 'off',
  windows = 'hdmi2',
  personal = 'hdmi3',
  work = 'hdmi1',
}
/**
 * ## In addition to normal functionality
 *
 * - Decorative light that that turns off during quiet hours
 * - A hue remote that acts as a input selection switch for a roku tv
 *   - AKA: big computer screen
 */
@Injectable()
export class LoftService extends SceneRoom {
  // #region Constructors

  constructor(
    protected readonly homeAssistantService: HomeAssistantService,
    @InjectPinoLogger(LoftService.name) protected readonly logger: PinoLogger,
    protected readonly entityService: EntityService,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly roomService: RoomService,
    @Inject(LOFT_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
  ) {
    super();
    roomService.ROOM_REGISTRY.loft = roomConfig;
  }

  // #endregion Constructors

  // #region Private Methods

  @Cron('0 0 22 * * *')
  private lightOff() {
    this.logger.debug('lightOff');
    return this.entityService.turnOff('switch.back_desk_light');
  }

  @Cron('0 0 7 * * *')
  private lightOn() {
    this.logger.debug('lightOn');
    return this.entityService.turnOn('switch.back_desk_light');
  }

  @OnEvent('switch.bedroom_switch/2')
  private screenToPersonal() {
    this.logger.debug('screenToPersonal');
    return this.roomService.setRoku(
      RokuInputs.personal,
      this.roomConfig.config.roku,
    );
  }

  @OnEvent('switch.bedroom_switch/1')
  private screenToWindows() {
    this.logger.debug('screenToWindows');
    return this.roomService.setRoku(
      RokuInputs.windows,
      this.roomConfig.config.roku,
    );
  }

  @OnEvent('switch.bedroom_switch/3')
  private screenToWork() {
    this.logger.debug('screenToWork');
    return this.roomService.setRoku(
      RokuInputs.work,
      this.roomConfig.config.roku,
    );
  }

  @OnEvent('loft/off')
  @OnEvent('switch.bedroom_switch/4')
  private screenOff() {
    this.logger.debug('screenOff');
    return this.roomService.setRoku(
      RokuInputs.off,
      this.roomConfig.config.roku,
    );
  }

  // #endregion Private Methods
}
