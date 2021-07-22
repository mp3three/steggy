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
export class GuestBedroomService implements RoomController {
  // #region Object Properties

  public readonly _CONTROLLER_SETTINGS: ControllerSettings = {
    devices: [
      {
        comboCount: 1,
        target: ['light.guest_left', 'light.guest_right', 'light.guest_door'],
      },
    ],
  };

  public name = ROOM_NAMES.guest;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(GuestBedroomService, APP_HOME_CONTROLLER)
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
  @OnEvent(`${ROOM_NAMES.guest}/areaOff`)
  public async areaOff(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.guest}/areaOn`)
  public async areaOn(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.guest}/dimDown`)
  public async dimDown(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.guest}/dimUp`)
  public async dimUp(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.guest}/favorite`)
  public async favorite(): Promise<boolean> {
    return true;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    this.lightingController.setRoomController('sensor.bedroom_pico', this);
  }

  // #endregion Protected Methods
}
