import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  RoutineCommandTriggerRoutineDTO,
  RoutineDTO,
} from '@steggy/controller-shared';

import { RoutineEnabledService } from '../activate';
import { RoutineService } from '../routine.service';

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
    routine: RoutineDTO,
    waitForChange = false,
  ): Promise<void> {
    const target = await this.routineService.get(command.routine);
    if (!target) {
      throw new NotFoundException(`Could not find routine`);
    }
    if (!command.ignoreEnabled) {
      const isEnabled = this.routineEnabled.ACTIVE_ROUTINES.has(target._id);
      if (!isEnabled) {
        this.logger.debug(
          `Attempted to trigger disabled routine [${target.friendlyName}]`,
        );
        return;
      }
    }
    this.logger.debug(`Routine trigger {${target.friendlyName}}`);
    await this.routineService.activateRoutine(
      target,
      {
        source: routine.friendlyName,
      },
      waitForChange,
    );
  }
}
