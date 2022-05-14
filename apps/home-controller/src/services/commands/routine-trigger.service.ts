import { forwardRef, Inject, NotFoundException } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import {
  iRoutineCommand,
  RoutineCommand,
  RoutineService,
} from '@steggy/controller-sdk';
import {
  RoutineCommandDTO,
  RoutineCommandTriggerRoutineDTO,
  RoutineDTO,
} from '@steggy/controller-shared';

@RoutineCommand({
  description: 'Trigger another routine',
  name: 'Trigger Routine',
  type: 'trigger_routine',
})
export class RoutineTriggerService
  implements iRoutineCommand<RoutineCommandTriggerRoutineDTO>
{
  constructor(
    private readonly logger: AutoLogService,
    @Inject(forwardRef(() => RoutineService))
    private readonly routineService: RoutineService,
  ) {}

  public async activate({
    command,
    routine,
    waitForChange,
  }: {
    command: RoutineCommandDTO<RoutineCommandTriggerRoutineDTO>;
    routine: RoutineDTO;
    runId: string;
    waitForChange: boolean;
  }): Promise<void> {
    const target = await this.routineService.get(command.command.routine);
    if (!target) {
      throw new NotFoundException(`Could not find routine`);
    }
    this.logger.debug(`Routine trigger {${target.friendlyName}}`);
    await this.routineService.activateRoutine(
      target,
      {
        force: command.command.force,
        source: routine.friendlyName,
      },
      waitForChange,
    );
  }
}
