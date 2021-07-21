import { ControllerSettings, RoomController } from '@automagical/contracts';
import { APP_HOME_CONTROLLER } from '@automagical/contracts/constants';
import { LutronPicoService } from '@automagical/custom';
import {
  EntityService,
  LightDomainService,
  RemoteDomainService,
  SwitchDomainService,
} from '@automagical/home-assistant';
import { InjectLogger, SolarCalcService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron } from '@nestjs/schedule';
import { PinoLogger } from 'nestjs-pino';

import { ROOM_NAMES } from '../typings';

const monitor = 'media_player.monitor';

@Injectable()
export class LoftService extends EntityService implements RoomController {
  // #region Object Properties

  public readonly _CONTROLLER_SETTINGS: ControllerSettings = {
    devices: [
      {
        comboCount: 1,
        target: [
          'light.loft_wall_bottom',
          'light.loft_wall_top',
          'light.loft_fan_bench_right',
          'light.loft_fan_desk_right',
          'light.loft_fan_desk_left',
          'light.loft_fan_bench_left',
          'switch.desk_light',
        ],
      },
      {
        comboCount: 2,
        target: ['switch.loft_hallway_light'],
      },
      {
        comboCount: 3,
        rooms: [
          ROOM_NAMES.downstairs,
          { name: ROOM_NAMES.master, type: 'off' },
          { name: ROOM_NAMES.games, type: 'off' },
        ],
      },
    ],
  };

  public name = ROOM_NAMES.loft;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(LoftService, APP_HOME_CONTROLLER)
    protected readonly logger: PinoLogger,
    private readonly picoService: LutronPicoService,
    private readonly remoteService: RemoteDomainService,
    private readonly switchService: SwitchDomainService,
    private readonly lightService: LightDomainService,
    private readonly solarCalcService: SolarCalcService,
    private readonly eventEmitterService: EventEmitter2,
  ) {
    super();
  }

  // #endregion Constructors

  // #region Public Methods

  @Trace()
  public async combo(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.loft}/off`)
  public async areaOff(count: number): Promise<boolean> {
    if (count !== 2) {
      return true;
    }
    await this.remoteService.turnOff(monitor);
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.loft}/on`)
  public async areaOn(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.loft}/dimDown`)
  public async dimDown(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.loft}/dimUp`)
  public async dimUp(): Promise<boolean> {
    return true;
  }

  @Trace()
  @OnEvent(`${ROOM_NAMES.loft}/favorite`)
  public async favorite(count: number): Promise<boolean> {
    if (count === 1) {
      const entity = this.ENTITIES.get(monitor);
      if (entity.state !== 'on') {
        await this.remoteService.turnOn(monitor);
      }
    }
    if (this.solarCalcService.IS_EVENING) {
      await this.eveningFavorite(count);
      return true;
    }
    return true;
  }

  // #endregion Public Methods

  // #region Protected Methods

  @Cron('0 0 22 * * *')
  protected async lightOff(): Promise<void> {
    await this.switchService.turnOff('switch.back_desk_light');
  }

  @Cron('0 0 7 * * *')
  protected async lightOn(): Promise<void> {
    await this.switchService.turnOn('switch.back_desk_light');
  }

  protected onModuleInit(): void {
    this.picoService.setRoomController('sensor.loft_pico', this);
    this.trackEntity(monitor);
  }

  // #endregion Protected Methods

  // #region Private Methods

  @Trace()
  private async eveningFavorite(count: number): Promise<void> {
    if (count === 1) {
      await this.lightService.circadianLight([
        'light.loft_fan_bench_right',
        'light.loft_fan_desk_right',
        'light.loft_fan_desk_left',
        'light.loft_fan_bench_left',
      ]);
      await this.lightService.turnOff([
        'light.loft_wall_bottom',
        'light.loft_wall_top',
      ]);
      await this.switchService.turnOn(['switch.desk_light']);
      await this.switchService.turnOff([
        'switch.loft_hallway_light',
        'switch.stair_lights',
      ]);
      return;
    }
    if (count === 2) {
      this.eventEmitterService.emit(`${ROOM_NAMES.master}/off`, count);
      this.eventEmitterService.emit(`${ROOM_NAMES.downstairs}/off`, count);
      this.eventEmitterService.emit(`${ROOM_NAMES.games}/off`, count);
    }
  }

  // #endregion Private Methods
}
