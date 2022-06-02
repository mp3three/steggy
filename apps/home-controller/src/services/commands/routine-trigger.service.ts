import {
  forwardRef,
  Inject,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
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
import { each, eachSeries, is } from '@steggy/utilities';

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
    command: { command },
    routine,
    waitForChange,
  }: {
    command: RoutineCommandDTO<RoutineCommandTriggerRoutineDTO>;
    routine: RoutineDTO;
    runId: string;
    waitForChange: boolean;
  }): Promise<void> {
    if (command.runChildren) {
      return await this.activateChildren(command, routine, waitForChange);
    }
    if (is.empty(command.routine)) {
      this.logger.error({ command, routine });
      throw new InternalServerErrorException(`Empty routine trigger target`);
    }
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

  private async activateChildren(
    { force }: RoutineCommandTriggerRoutineDTO,
    { _id, friendlyName }: RoutineDTO,
    waitForChange: boolean,
  ): Promise<void> {
    const children = await this.routineService.list({
      filters: new Set([{ field: 'parent', value: _id }]),
    });
    if (is.empty(children)) {
      this.logger.warn(`[${friendlyName}] 🚫👶 Has no children to activate`);
      return;
    }
    const trigger = async routine => {
      this.logger.debug(`Routine trigger {${routine.friendlyName}}`);
      await this.routineService.activateRoutine(
        routine,
        {
          force: force,
          source: friendlyName,
        },
        waitForChange,
      );
    };
    if (waitForChange) {
      await eachSeries(children, trigger);
      return;
    }
    await each(children, trigger);
  }
}
