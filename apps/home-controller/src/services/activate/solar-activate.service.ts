import { AutoLogService, Cron } from '@steggy/boilerplate';
import {
  ActivationEvent,
  iActivationEvent,
  SolarCalcService,
} from '@steggy/controller-sdk';
import {
  RoutineActivateDTO,
  RoutineDTO,
  SolarActivateDTO,
} from '@steggy/controller-shared';
import { CronExpression, TitleCase } from '@steggy/utilities';
import { nextTick } from 'async';
import { CronJob } from 'cron';

import { SolarWatcher } from '../../typings';

@ActivationEvent({
  description:
    'Activate at a predetermined time based on the position of the sun',
  name: 'Solar Event',
  type: 'solar',
})
export class SolarActivateService
  implements iActivationEvent<SolarActivateDTO>
{
  constructor(
    private readonly logger: AutoLogService,
    private readonly solarCalc: SolarCalcService,
  ) {}

  private SCHEDULES = new Set<SolarWatcher>();

  public clearRoutine({ _id }: RoutineDTO): void {
    this.SCHEDULES.forEach(item => {
      if (item.routine._id !== _id) {
        return;
      }
      this.SCHEDULES.delete(item);
    });
  }

  public reset(): void {
    this.SCHEDULES.forEach(({ cron }) => cron?.stop());
    this.SCHEDULES = new Set();
  }

  public watch(
    routine: RoutineDTO,
    { activate }: RoutineActivateDTO<SolarActivateDTO>,
    callback: () => Promise<void>,
  ): void {
    /**
     * Pile of race conditions happening here.
     *
     * Solar calc requires coords from home assistant, which are not presetnt at boot
     * This function cannot block until coords arrive.
     * Gets called during the init process, but is one of the last items to complete in the startup logs
     */
    nextTick(async () => {
      const c = await this.solarCalc.getCalc();
      const calc = c[activate.event] as Date;
      const cron = new CronJob(calc, async () => {
        this.logger.debug(`Solar event {${TitleCase(activate.event)}}`);
        await callback();
      });
      this.SCHEDULES.add({
        ...activate,
        callback,
        cron,
        routine,
      });
      if (calc.getTime() < Date.now()) {
        this.logger.debug(
          `{${TitleCase(activate.event)}} already fired for today`,
        );
        return;
      }
      cron.start();
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  protected dailyReset(): void {
    const current = this.SCHEDULES;
    this.reset();
    current.forEach(({ routine, callback, ...activate }) =>
      this.watch(
        routine,
        { activate } as RoutineActivateDTO<SolarActivateDTO>,
        callback,
      ),
    );
  }
}
