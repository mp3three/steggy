import { ControllerSettings, RoomController } from '@automagical/contracts';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { PicoStates } from '@automagical/contracts/home-assistant';
import { LightingControllerService } from '@automagical/custom';
import {
  FanDomainService,
  LightDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { InjectLogger, SolarCalcService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
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
    private readonly picoService: LightingControllerService,
    private readonly switchService: SwitchDomainService,
    private readonly solarCalcService: SolarCalcService,
    private readonly lightService: LightDomainService,
    private readonly fanService: FanDomainService,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async combo(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.master}/areaOff`)
  public async areaOff(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.master}/areaOn`)
  public async areaOn(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.master}/dimDown`)
  public async dimDown(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.master}/dimUp`)
  public async dimUp(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.master}/favorite`)
  public async favorite(count: number): Promise<boolean> {
    if (this.solarCalcService.IS_EVENING) {
      await this.eveningFavorite(count);
      return true;
    }
    await this.dayFavorite();
    return true;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Trace()
  protected onModuleInit(): void {
    this.picoService.setRoomController('sensor.bedroom_pico', this);
    this.picoService.watch(
      'sensor.bed_pico',
      async (button: PicoStates): Promise<boolean> => {
        await this.bedPico(button);
        return false;
      },
    );
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private async bedPico(button: PicoStates): Promise<void> {
    switch (button) {
      case PicoStates.favorite:
        await this.switchService.toggle('switch.womp');
        return;
      case PicoStates.off:
        await this.areaOff();
        return;
      case PicoStates.on:
        await this.areaOn();
        return;
      case PicoStates.up:
        await this.fanService.increaseSpeed('fan');
        return;
    }
  }

  @Trace()
  private async dayFavorite(): Promise<void> {
    await this.switchService.toggle('switch.womp');
  }

  @Trace()
  private async eveningFavorite(count: number): Promise<void> {
    if (count === 1) {
      await this.switchService.turnOff('switch.womp');
      await this.lightService.turnOff([
        'light.bedroom_fan_top_left',
        'light.bedroom_fan_top_right',
        'light.bedroom_fan_bottom_left',
        'light.bedroom_fan_bottom_right',
      ]);
      await this.lightService.turnOn(['light.speaker_light']);
    }
  }

  // #endregion Private Methods
}
