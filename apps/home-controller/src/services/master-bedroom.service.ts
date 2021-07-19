import { RoomController } from '@automagical/contracts';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { PicoStates } from '@automagical/contracts/home-assistant';
import {
  LutronPicoService,
  RemoteDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';

import { ROOM_NAMES } from '../typings';

@Injectable()
export class MasterBedroomService implements RoomController {
  // #region Object Properties

  public readonly _CONTROLLER_SETTINGS = {
    lights: [
      'light.loft_wall_bottom',
      'light.loft_wall_top',
      'light.loft_fan_bench_right',
      'light.loft_fan_desk_right',
      'light.loft_fan_desk_left',
      'light.loft_fan_bench_left',
    ],
    switch: ['switch.desk_light', 'switch.loft_hallway_light'],
  };

  public name = ROOM_NAMES.loft;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(MasterBedroomService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
    private readonly picoService: LutronPicoService,
    private readonly remoteService: RemoteDomainService,
    private readonly switchService: SwitchDomainService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async areaOff(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async areaOn(): Promise<boolean> {
    return true;
  }

  @Trace()
  public async combo(actions: PicoStates[]): Promise<boolean> {
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

  @Trace()
  protected onModuleInit(): void {
    this.picoService.setRoomController('sensor.bedroom_pico', this);
  }

  // #endregion Protected Methods
}
