import { ControllerSettings, RoomController } from '@automagical/contracts';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { LightingControllerService } from '@automagical/custom';
import { SwitchDomainService } from '@automagical/home-assistant';
import { InjectLogger, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { PinoLogger } from 'nestjs-pino';

import { ROOM_NAMES } from '../typings';

@Injectable()
export class GamesRoomService implements RoomController {
  // #region Object Properties

  public readonly _CONTROLLER_SETTINGS: ControllerSettings = {
    devices: [
      {
        comboCount: 1,
        target: [
          'light.games_1',
          'light.games_2',
          'light.games_3',
          'light.games_lamp',
        ],
      },
    ],
  };

  public name = ROOM_NAMES.games;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(GamesRoomService, APP_HOME_CONTROLLER)
    private readonly logger: PinoLogger,
    private readonly lightingController: LightingControllerService,
    private readonly switchService: SwitchDomainService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async combo(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.games}/areaOff`)
  public async areaOff(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.games}/areaOn`)
  public async areaOn(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.games}/dimDown`)
  public async dimDown(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.games}/dimUp`)
  public async dimUp(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.games}/favorite`)
  public async favorite(count: number): Promise<boolean> {
    if (count === 1) {
      await this.lightingController.circadianLight(
        ['light.games_1', 'light.games_2', 'light.games_3', 'light.games_lamp'],
        30,
      );
      return false;
    }
    if (count === 2) {
      await this.lightingController.roomOff(ROOM_NAMES.loft);
      await this.lightingController.roomOff(ROOM_NAMES.downstairs);
      await this.lightingController.roomOff(ROOM_NAMES.master);
      return false;
    }
    return false;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    this.lightingController.setRoomController('sensor.games_pico', this);
  }

  // #endregion Protected Methods
}
