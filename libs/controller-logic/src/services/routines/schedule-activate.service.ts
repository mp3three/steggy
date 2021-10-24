import {
  ScheduleActivateDTO,
  ScheduleWatcher,
} from '@automagical/controller-logic';
import { AutoLogService, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';

@Injectable()
export class ScheduleActivateService {
  constructor(private readonly logger: AutoLogService) {}

  private SCHEDULES = new Set<ScheduleWatcher>();

  @Trace()
  public reset(): void {
    this.SCHEDULES.forEach(({ cron }) => cron.stop());
    this.SCHEDULES = new Set();
  }

  @Trace()
  public watch(
    activate: ScheduleActivateDTO,
    callback: () => Promise<void>,
  ): void {
    const cron = new CronJob(activate.schedule, async () => await callback());
    this.SCHEDULES.add({
      ...activate,
      cron,
    });
    cron.start();
  }
}
