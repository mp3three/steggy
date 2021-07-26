import { ControllerSettings, RoomController } from '@automagical/contracts';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { LightingControllerService } from '@automagical/custom';
import { SwitchDomainService } from '@automagical/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';

import { ROOM_NAMES } from '../typings';

@Injectable()
export class DownstairsService implements RoomController {
  // #region Object Properties

  public readonly _CONTROLLER_SETTINGS: ControllerSettings = {
    devices: [
      {
        comboCount: 1,
        target: [
          'light.living_room_back',
          'light.living_room_front',
          'light.living_room_left',
          'light.living_room_right',
          'switch.media_center_light',
          'switch.couch_light',
        ],
      },
      {
        comboCount: 2,
        target: ['switch.bar_light', 'switch.entryway_light'],
      },
      {
        comboCount: 3,
        rooms: [ROOM_NAMES.loft],
        target: [
          'switch.dining_room_light',
          'switch.kitchen_light',
          'switch.stair_lights',
          'switch.back_yard_light',
          'switch.front_porch_light',
        ],
      },
    ],
  };

  public name = ROOM_NAMES.downstairs;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(DownstairsService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
    private readonly lightingController: LightingControllerService,
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
    this.lightingController.setRoomController('sensor.living_pico', this);
  }

  // #endregion Protected Methods
}
