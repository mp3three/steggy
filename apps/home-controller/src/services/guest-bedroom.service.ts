import { RoomController } from '@automagical/contracts';
import { LightingControllerService } from '@automagical/custom';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ROOM_NAMES } from '../typings';

@Injectable()
export class GuestBedroomService implements RoomController {
  // #region Object Properties

  public name = ROOM_NAMES.guest;

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly lightingController: LightingControllerService) {}

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
