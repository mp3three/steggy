import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { HomeAssistantRoomConfigDTO } from '@automagical/contracts/home-assistant';
import {
  EntityService,
  HomeAssistantService,
  AreaService,
  SceneRoom,
} from '@automagical/home-assistant';
import { InjectLogger } from '@automagical/utilities';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';
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
    @InjectLogger(LoftService, APP_HOME_CONTROLLER)
    protected readonly logger: PinoLogger,
    protected readonly entityService: EntityService,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly roomService: AreaService,
    @Inject(LOFT_CONFIG)
    protected readonly roomConfig: HomeAssistantRoomConfigDTO,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Private Methods

  @Cron('0 0 22 * * *')
  private async lightOff() {
    this.logger.debug('lightOff');
    await this.entityService.turnOff('switch.back_desk_light');
  }

  @Cron('0 0 7 * * *')
  private async lightOn() {
    this.logger.debug('lightOn');
    await this.entityService.turnOn('switch.back_desk_light');
  }

  @OnEvent('switch.bedroom_switch/2')
  private async screenToPersonal() {
    this.logger.debug('screenToPersonal');
    await this.roomService.setRoku(
      RokuInputs.personal,
      this.roomConfig.config.roku,
    );
  }

  @OnEvent('switch.bedroom_switch/1')
  private async screenToWindows() {
    this.logger.debug('screenToWindows');
    await this.roomService.setRoku(
      RokuInputs.windows,
      this.roomConfig.config.roku,
    );
  }

  @OnEvent('switch.bedroom_switch/3')
  private async screenToWork() {
    this.logger.debug('screenToWork');
    await this.roomService.setRoku(
      RokuInputs.work,
      this.roomConfig.config.roku,
    );
  }

  @OnEvent('loft/off')
  @OnEvent('switch.bedroom_switch/4')
  private async screenOff() {
    this.logger.debug('screenOff');
    await this.roomService.setRoku(RokuInputs.off, this.roomConfig.config.roku);
  }

  // #endregion Private Methods
}
