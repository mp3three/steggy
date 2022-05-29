import { AutoLogService } from '@steggy/boilerplate';
import { ActivationEvent, iActivationEvent } from '@steggy/controller-sdk';
import {
  RoutineActivateDTO,
  RoutineDTO,
  ScheduleActivateDTO,
} from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { CronJob } from 'cron';
import { nextTick } from 'process';

import { ScheduleWatcher } from '../../typings';

@ActivationEvent({
  description: 'Activate on a regular cron schedule',
  name: 'Cron Schedule',
  type: 'schedule',
})
export class ScheduleActivateService
  implements iActivationEvent<ScheduleActivateDTO>
{
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
    { activate }: RoutineActivateDTO<ScheduleActivateDTO>,
    callback: () => Promise<void>,
  ): void {
    nextTick(() => {
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
