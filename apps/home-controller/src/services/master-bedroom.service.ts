import { iRoomController } from '@automagical/contracts';
import {
  LightingControllerService,
  RoomController,
} from '@automagical/controller-logic';
import {
  FanDomainService,
  LightDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ROOM_FAVORITE, ROOM_NAMES } from '../typings';

@Injectable()
@RoomController({
  friendlyName: 'Master Bedroom',
  name: 'master',
})
export class MasterBedroomService implements iRoomController {
  // #region Object Properties

  public name = ROOM_NAMES.master;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    private readonly lightingController: LightingControllerService,
    private readonly switchService: SwitchDomainService,
    private readonly lightService: LightDomainService,
    private readonly fanService: FanDomainService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @OnEvent(ROOM_FAVORITE(ROOM_NAMES.master))
  @Trace()
  public async favorite(count: number): Promise<boolean> {
    if (count === 1) {
      await this.switchService.turnOff('switch.womp');
      await this.lightService.turnOff([
        'light.bedroom_fan_top_left',
        'light.bedroom_fan_top_right',
        'light.bedroom_fan_bottom_left',
        'light.bedroom_fan_bottom_right',
      ]);
      await this.lightingController.circadianLight(['light.speaker_light'], 40);
    }
    if (count === 2) {
      await this.lightingController.roomOff([
        ROOM_NAMES.loft,
        ROOM_NAMES.downstairs,
        ROOM_NAMES.games,
      ]);
    }
    return false;
  }

  @Trace()
  public async areaOff(count: number): Promise<boolean> {
    if (count === 3) {
      await this.fanService.turnOff('fan.master_bedroom_ceiling_fan');
    }
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
    this.lightingController.setRoomController('sensor.bedroom_pico', this, {
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
          rooms: [
            ROOM_NAMES.loft,
            { name: ROOM_NAMES.downstairs, type: 'off' },
          ],
        },
        {
          comboCount: 3,
          rooms: [ROOM_NAMES.downstairs],
        },
      ],
    });
  }

  // #endregion Protected Methods
}
