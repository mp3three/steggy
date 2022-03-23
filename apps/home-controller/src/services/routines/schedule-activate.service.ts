import { AutoLogService } from '@automagical/boilerplate';
import {
  RoutineDTO,
  ScheduleActivateDTO,
  ScheduleWatcher,
} from '@automagical/controller-shared';
import { is } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';

@Injectable()
export class ScheduleActivateService {
  constructor(private readonly logger: AutoLogService) {}

  private SCHEDULES = new Set<ScheduleWatcher>();

  public clearRoutine({ _id }: RoutineDTO): void {
    this.SCHEDULES.forEach(item => {
      if (item.routine._id !== _id) {
        return;
      }
      item.cron.stop();
      this.SCHEDULES.delete(item);
    });
  }

  public reset(): void {
    this.SCHEDULES.forEach(({ cron }) => cron.stop());
    this.SCHEDULES = new Set();
  }

  public watch(
    routine: RoutineDTO,
    activate: ScheduleActivateDTO,
    callback: () => Promise<void>,
  ): void {
    process.nextTick(() => {
      if (is.empty(activate?.schedule)) {
        this.logger.error(
          { activate },
          `[${routine.friendlyName}] Invalid activation event`,
        );
        return;
      }
      const cron = new CronJob(activate.schedule, async () => {
        this.logger.debug(`{${activate.schedule}} Cron activate`);
        await callback();
      });
      this.SCHEDULES.add({
        ...activate,
        cron,
        routine,
      });
      cron.start();
    });
  }
}
