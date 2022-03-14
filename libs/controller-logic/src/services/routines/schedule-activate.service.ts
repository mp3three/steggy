import { AutoLogService } from '@automagical/boilerplate';
import {
  ScheduleActivateDTO,
  ScheduleWatcher,
} from '@automagical/controller-shared';
import { Injectable } from '@nestjs/common';
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
    process.nextTick(() => {
      const cron = new CronJob(activate.schedule, async () => {
        this.logger.debug(`{${activate.schedule}} Cron activate`);
        await callback();
      });
      this.SCHEDULES.add({
        ...activate,
        cron,
      });
      cron.start();
    });
  }
}
