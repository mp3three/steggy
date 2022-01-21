import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@text-based/boilerplate';
import {
  ScheduleActivateDTO,
  ScheduleWatcher,
} from '@text-based/controller-shared';
import { CronJob } from 'cron';

@Injectable()
export class ScheduleActivateService {
  constructor(private readonly logger: AutoLogService) {}

  private SCHEDULES = new Set<ScheduleWatcher>();

  public reset(): void {
    this.SCHEDULES.forEach(({ cron }) => cron.stop());
    this.SCHEDULES = new Set();
  }

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
