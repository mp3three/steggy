import { RoomController } from '@automagical/contracts';
import { LightingControllerService } from '@automagical/custom';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ROOM_NAMES } from '../typings';

@Injectable()
export class GamesRoomService implements RoomController {
  // #region Object Properties

  public name = ROOM_NAMES.games;

  // #endregion Object Properties

  // #region Constructors

  constructor(private readonly lightingController: LightingControllerService) {}

  // #endregion Constructors

  // #region Public Methods

  @OnEvent(`${ROOM_NAMES.games}/areaOff`)
  @Trace()
  public async areaOff(): Promise<boolean> {
    return true;
  }

  @OnEvent(`${ROOM_NAMES.games}/areaOn`)
  @Trace()
  public async areaOn(): Promise<boolean> {
    return true;
  }

  @OnEvent(`${ROOM_NAMES.games}/dimDown`)
  @Trace()
  public async dimDown(): Promise<boolean> {
    return true;
  }

  @OnEvent(`${ROOM_NAMES.games}/dimUp`)
  @Trace()
  public async dimUp(): Promise<boolean> {
    return true;
  }

  @OnEvent(`${ROOM_NAMES.games}/favorite`)
  @Trace()
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

  @Trace()
  public async combo(): Promise<boolean> {
    return true;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    this.lightingController.setRoomController('sensor.games_pico', this, {
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
    });
  }

  // #endregion Protected Methods
}
