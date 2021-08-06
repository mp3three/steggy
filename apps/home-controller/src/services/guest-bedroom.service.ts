import { iRoomController } from '@automagical/contracts';
import { LightingControllerService } from '@automagical/controller-logic';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ROOM_FAVORITE, ROOM_NAMES } from '../typings';

@Injectable()
export class GuestBedroomService implements iRoomController {
  // #region Object Properties

  public name = ROOM_NAMES.guest;

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly lightingController: LightingControllerService) {}

  // #endregion Constructors

  // #region Public Methods

  @OnEvent(ROOM_FAVORITE(ROOM_NAMES.guest))
  @Trace()
  public async favorite(): Promise<boolean> {
    return true;
  }

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

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    this.lightingController.setRoomController('sensor.guest_pico', this, {
      devices: [
        {
          comboCount: 1,
          target: ['light.guest_left', 'light.guest_right', 'light.guest_door'],
        },
      ],
    });
  }

  // #endregion Protected Methods
}
