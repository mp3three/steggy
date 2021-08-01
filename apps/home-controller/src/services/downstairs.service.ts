import { RoomController } from '@automagical/contracts';
import { LightingControllerService } from '@automagical/controller-logic';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ROOM_FAVORITE, ROOM_NAMES } from '../typings';

@Injectable()
export class DownstairsService implements RoomController {
  // #region Object Properties

  public name = ROOM_NAMES.downstairs;

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly lightingController: LightingControllerService) {}

  // #endregion Constructors

  // #region Public Methods

  @OnEvent(ROOM_FAVORITE(ROOM_NAMES.downstairs))
  @Trace()
  public async favorite(): Promise<boolean> {
    return false;
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
    this.lightingController.setRoomController('sensor.living_pico', this, {
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
          rooms: [ROOM_NAMES.loft, ROOM_NAMES.master, ROOM_NAMES.guest],
          target: [
            'switch.dining_room_light',
            'switch.kitchen_light',
            'switch.stair_lights',
            'switch.back_yard_light',
            'switch.front_porch_light',
          ],
        },
      ],
    });
  }

  // #endregion Protected Methods
}
