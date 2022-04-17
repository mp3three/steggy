import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { RoutineCommandTriggerRoutineDTO } from '@steggy/controller-shared';

import { RoutineEnabledService, RoutineService } from '../routines';

@Injectable()
export class RoutineTriggerService {
  constructor(
    private readonly logger: AutoLogService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineService: RoutineService,
    @Inject(forwardRef(() => RoutineEnabledService))
    private readonly routineEnabled: RoutineEnabledService,
  ) {}

  public async activate(
    command: RoutineCommandTriggerRoutineDTO,
    waitForChange = false,
  ): Promise<void> {
    const routine = await this.routineService.get(command.routine);
    if (!routine) {
      throw new NotFoundException(`Could not find routine`);
    }
    if (!command.ignoreEnabled) {
      const isEnabled = this.routineEnabled.ACTIVE_ROUTINES.has(routine._id);
      if (!isEnabled) {
        this.logger.debug(
          `Attempted to trigger disabled routine [${routine.friendlyName}]`,
        );
        return;
      }
    }
    this.logger.debug(`Routine trigger {${routine.friendlyName}}`);
    await this.routineService.activateRoutine(
      routine,
      undefined,
      waitForChange,
    );
  }
}
