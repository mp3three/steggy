import {
  APP_HOME_CONTROLLER,
  HA_SOCKET_READY,
} from '@automagical/contracts/constants';
import {
  BatteryStateDTO,
  domain,
  HASS_DOMAINS,
} from '@automagical/contracts/home-assistant';
import {
  EntityManagerService,
  NotifyDomainService,
} from '@automagical/home-assistant';
import { InjectLogger, sleep, SolarCalcService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Cron, Timeout } from '@nestjs/schedule';
import { each } from 'async';
import dayjs from 'dayjs';
import { PinoLogger } from 'nestjs-pino';

@Injectable()
export class ApplicationService {
  // #region Object Properties

  // private logger = Logger(AppService);
  private connectionReady = false;

  // #endregion Object Properties

  // #region Constructors

  constructor(
    @InjectLogger(ApplicationService, APP_HOME_CONTROLLER)
    protected readonly logger: PinoLogger,
    private readonly solarCalc: SolarCalcService,
    private readonly notifyService: NotifyDomainService,
    private readonly entityManager: EntityManagerService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  // #endregion Constructors

  // #region Public Methods

  public onModuleInit(): void {
    setTimeout(async () => {
      this.eventEmitter.emit('asdf', 1);
      await sleep(100);
      this.eventEmitter.emit('qwerty', 2);
      // await this.dayInfo();
    }, 1000);
  }

  // #endregion Public Methods

  // #region Protected Methods

  /**
   * Hey! Parts of the house need batteries swapped out
   *
   * Maybe add it as a weekend item
   */
  @Cron('0 0 11 * * Sat')
  protected async batteryMonitor(): Promise<void> {
    const entities = this.entityManager.listEntities().filter((id) => {
      return (
        domain(id) === HASS_DOMAINS.sensor &&
        ['door', 'switch'].some((item) => id.includes(item)) &&
        id.includes('battery')
      );
    });
    this.entityManager
      .getEntity<BatteryStateDTO>(entities)
      .forEach((entity) => {
        const pct = Number(entity.state);
        if (pct < 10) {
          this.notifyService.notify(
            `${entity.attributes.friendly_name} is at ${entity.state}%`,
          );
        }
      });
  }

  /**
   * What time is the big light bulb in the sky going away?
   */
  @Cron('0 0 11 * * *')
  protected async dayInfo(): Promise<void> {
    const { SOLAR_CALC } = this.solarCalc;
    const start = dayjs(SOLAR_CALC.goldenHourStart).format('hh:mm');
    const end = dayjs(SOLAR_CALC.goldenHourEnd).format('hh:mm');
    const dusk = dayjs(SOLAR_CALC.dusk).format('hh:mm');
    const message = [
      dayjs().format('ddd MMM DD'),
      `🌄 Golen Hour: ${start} - ${end}`,
      `🌃 Dusk: ${dusk}`,
    ].join(`\n`);
    await this.notifyService.notify(`${message}\n${message}`);
  }

  @OnEvent(HA_SOCKET_READY)
  protected async onSocketReset(): Promise<void> {
    if (!this.connectionReady) {
      this.connectionReady = true;
      return;
    }
    await this.notifyService.notify(
      `Connection reset at ${new Date().toISOString()}`,
      {
        title: `Temporarily lost connection with Home Assistant`,
      },
    );
  }

  // #endregion Protected Methods
}
