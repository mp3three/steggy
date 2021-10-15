import { SolarCalcService } from '@automagical/controller-logic';
import {
  BatteryStateDTO,
  domain,
  EntityManagerService,
  HA_SOCKET_READY,
  HASS_DOMAINS,
  NotifyDomainService,
} from '@automagical/home-assistant';
import {
  AutoLogService,
  Cron,
  Debug,
  InjectConfig,
  OnEvent,
  Trace,
} from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import dayjs from 'dayjs';

import { BATTERY_NOTIFY_PERCENT } from '../config';

@Injectable()
export class ApplicationService {
  constructor(
    protected readonly logger: AutoLogService,
    private readonly solarCalc: SolarCalcService,
    private readonly notifyService: NotifyDomainService,
    private readonly entityManager: EntityManagerService,
    @InjectConfig(BATTERY_NOTIFY_PERCENT)
    private readonly notifyPercent: number,
  ) {}
  private connectionReady = false;

  /**
   * Hey! Parts of the house need batteries swapped out
   *
   * Maybe add it as a weekend item
   */
  @Cron('0 0 11 * * Sat')
  @Debug('Battery monitor')
  protected batteryMonitor(): void {
    const entities = this.entityManager.listEntities().filter((id) => {
      return (
        domain(id) === HASS_DOMAINS.sensor &&
        ['door', 'switch'].some((item) => id.includes(item)) &&
        id.includes('battery')
      );
    });
    this.entityManager
      .getEntities<BatteryStateDTO>(entities)
      .forEach((entity) => {
        const pct = Number(entity.state);
        if (pct < this.notifyPercent) {
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
  @Debug('Sending day info')
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
    await this.notifyService.notify(`${message}`);
  }

  @OnEvent(HA_SOCKET_READY)
  @Trace()
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
}
