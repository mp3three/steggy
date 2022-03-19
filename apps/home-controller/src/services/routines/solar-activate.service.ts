import { AutoLogService, Cron } from '@automagical/boilerplate';
import {
  RoutineDTO,
  SolarActivateDTO,
  SolarWatcher,
} from '@automagical/controller-shared';
import { CronExpression, TitleCase } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';
import { CronJob } from 'cron';

import { SolarCalcService } from '../lighting';

@Injectable()
export class SolarActivateService {
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
    activate: SolarActivateDTO,
    callback: () => Promise<void>,
  ): void {
    /**
     * Pile of race conditions happening here.
     *
     * Solar calc requires coords from home assistant, which are not presetnt at boot
     * This function cannot block until coords arrive.
     * Gets called during the init process, but is one of the last items to complete in the startup logs
     */
    process.nextTick(async () => {
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
          `{${TitleCase(activate.event, false)}} already fired for today`,
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
    current.forEach(i => this.watch(i.routine, i, i.callback));
  }
}
