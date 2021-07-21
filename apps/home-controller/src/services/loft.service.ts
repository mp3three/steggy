import { ControllerSettings, RoomController } from '@automagical/contracts';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { LutronPicoService } from '@automagical/custom';
import {
  RemoteDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';

import { ROOM_NAMES } from '../typings';

@Injectable()
export class LoftService implements RoomController {
  // #region Object Properties

  public readonly _CONTROLLER_SETTINGS: ControllerSettings = {
    devices: [
      {
        comboCount: 1,
        target: [
          'light.loft_wall_bottom',
          'light.loft_wall_top',
          'light.loft_fan_bench_right',
          'light.loft_fan_desk_right',
          'light.loft_fan_desk_left',
          'light.loft_fan_bench_left',
          'switch.desk_light',
        ],
      },
      {
        comboCount: 2,
        target: ['switch.loft_hallway_light'],
      },
      {
        comboCount: 3,
        rooms: [
          ROOM_NAMES.downstairs,
          { name: ROOM_NAMES.master, type: 'off' },
          { name: ROOM_NAMES.games, type: 'off' },
        ],
      },
    ],
  };

  public name = ROOM_NAMES.loft;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(LoftService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
    private readonly picoService: LutronPicoService,
    private readonly remoteService: RemoteDomainService,
    private readonly switchService: SwitchDomainService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(): Promise<boolean> {
    await this.remoteService.turnOff('media_player.monitor');
    return true;
  }

  @Trace()
  public async areaOn(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async combo(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async dimDown(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async dimUp(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async favorite(): Promise<boolean> {
    return true;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Cron('0 0 22 * * *')
  @Trace()
  protected async lightOff(): Promise<void> {
    await this.switchService.turnOff('switch.back_desk_light');
  }

  @Cron('0 0 7 * * *')
  @Trace()
  protected async lightOn(): Promise<void> {
    await this.switchService.turnOn('switch.back_desk_light');
  }

  @Trace()
  protected onModuleInit(): void {
    this.picoService.setRoomController('sensor.loft_pico', this);
  }

  // #endregion Protected Methods
}
