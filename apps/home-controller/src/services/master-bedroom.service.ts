import { ControllerSettings, RoomController } from '@automagical/contracts';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { LutronPicoService } from '@automagical/custom';
import { SwitchDomainService } from '@automagical/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { ROOM_NAMES } from '../typings';

@Injectable()
export class MasterBedroomService implements RoomController {
  // #region Object Properties

  public readonly _CONTROLLER_SETTINGS: ControllerSettings = {
    devices: [
      {
        comboCount: 1,
        target: [
          'switch.womp',
          'light.speaker_light',
          'light.bedroom_fan_top_left',
          'light.bedroom_fan_top_right',
          'light.bedroom_fan_bottom_left',
          'light.bedroom_fan_bottom_right',
        ],
      },
      {
        comboCount: 2,
        rooms: [ROOM_NAMES.loft, { name: ROOM_NAMES.downstairs, type: 'off' }],
      },
      {
        comboCount: 3,
        rooms: [ROOM_NAMES.downstairs],
      },
    ],
  };

  public name = ROOM_NAMES.master;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(MasterBedroomService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
    private readonly picoService: LutronPicoService,
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

  @Trace()
  protected onModuleInit(): void {
    this.picoService.setRoomController('sensor.bedroom_pico', this);
  }

  // #endregion Protected Methods
}
