import { AutoLogService } from '@ccontour/utilities';
import { Injectable, NotFoundException } from '@nestjs/common';

import { RoutineCommandTriggerRoutineDTO } from '../../contracts';
import { RoutineService } from '../routines';

@Injectable()
export class RoutineTriggerService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly routineService: RoutineService,
  ) {}

  public async activate(
    command: RoutineCommandTriggerRoutineDTO,
  ): Promise<void> {
    const routine = await this.routineService.get(command.routine);
    if (!routine) {
      throw new NotFoundException(`Could not find routine`);
    }
    this.logger.debug(`Routine trigger {${routine.friendlyName}}`);
    await this.routineService.activateRoutine(routine);
  }
}
