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

import { RoutineService } from '../routine.service';

@Injectable()
export class RoutineTriggerService {
  constructor(
    private readonly logger: AutoLogService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineService: RoutineService,
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
    this.logger.debug(`Routine trigger {${target.friendlyName}}`);
    await this.routineService.activateRoutine(
      target,
      {
        force: command.force,
        source: routine.friendlyName,
      },
      waitForChange,
    );
  }
}
