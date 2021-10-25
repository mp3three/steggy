import { AutoLogService, IsEmpty, Trace } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

import {
  KunamiCodeActivateDTO,
  ROUTINE_ACTIVATE_TYPE,
  RoutineDTO,
  ScheduleActivateDTO,
  StateChangeActivateDTO,
} from '../../contracts';
import { RoutinePersistenceService } from '../persistence';
import { KunamiCodeActivateService } from './kunami-code-activate.service';
import { ScheduleActivateService } from './schedule-activate.service';
import { StateChangeActivateService } from './state-change-activate.service';

@Injectable()
export class RoutineService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly routinePersistence: RoutinePersistenceService,
    private readonly kunamiCode: KunamiCodeActivateService,
    private readonly scheduleActivate: ScheduleActivateService,
    private readonly stateChangeActivate: StateChangeActivateService,
  ) {}

  @Trace()
  public async activateRoutine(routine: RoutineDTO | string): Promise<void> {
    routine = await this.load(routine);
    this.logger.info(`[${routine.friendlyName}] activate`);
  }

  @Trace()
  protected async mount(): Promise<void> {
    const allRoutines = await this.routinePersistence.findMany();
    this.kunamiCode.reset();
    this.scheduleActivate.reset();
    this.stateChangeActivate.reset();
    allRoutines.forEach((routine) => {
      if (IsEmpty(routine.activate)) {
        this.logger.warn(`[${routine.friendlyName}] no activation events`);
        return;
      }
      this.logger.info(`[${routine.friendlyName}] building`);
      routine.activate.forEach((activate) => {
        this.logger.debug(` - ${activate.friendlyName}`);
        switch (activate.type) {
          case ROUTINE_ACTIVATE_TYPE.kunami:
            this.kunamiCode.watch(
              activate.activate as KunamiCodeActivateDTO,
              async () => await this.activateRoutine(routine),
            );
            return;
          case ROUTINE_ACTIVATE_TYPE.state_change:
            this.stateChangeActivate.watch(
              activate.activate as StateChangeActivateDTO,
              async () => await this.activateRoutine(routine),
            );
            return;
          case ROUTINE_ACTIVATE_TYPE.schedule:
            this.scheduleActivate.watch(
              activate.activate as ScheduleActivateDTO,
              async () => await this.activateRoutine(routine),
            );
            return;
        }
      });
    });
  }

  @Trace()
  private async load(routine: RoutineDTO | string): Promise<RoutineDTO> {
    if (typeof routine === 'object') {
      return routine;
    }
    return await this.routinePersistence.findById(routine);
  }
}
