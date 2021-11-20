import { SolarCalcService } from '@automagical/controller-logic';
import { AutoLogService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import { ScheduleWatcher, SolarActivateDTO } from '../../contracts';

@Injectable()
export class SolarActivateService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly solarCalc: SolarCalcService,
  ) {}

  private SCHEDULES = new Set<ScheduleWatcher>();

  public reset(): void {
    this.SCHEDULES.forEach(({ cron }) => cron.stop());
    this.SCHEDULES = new Set();
  }

  public watch(
    activate: SolarActivateDTO,
    callback: () => Promise<void>,
  ): void {
    // const cron = new CronJob(activate.schedule, async () => await callback());
    // this.SCHEDULES.add({
    //   ...activate,
    //   cron,
    // });
    // cron.start();
  }
}
