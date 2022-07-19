import {
  iRoutineCommand,
  RoutineCommand,
  VMService,
} from '@steggy/controller-sdk';
import {
  RoutineCodeCommandDTO,
  RoutineCommandDTO,
} from '@steggy/controller-shared';

@RoutineCommand({
  description: 'Execute typescript code as an action',
  name: 'Execute Code',
  type: 'execute_code',
})
export class ExecuteCodeCommandService
  implements iRoutineCommand<RoutineCodeCommandDTO>
{
  constructor(private readonly vm: VMService) {}

  public async activate({
    command,
    waitForChange,
  }: {
    command: RoutineCommandDTO<RoutineCodeCommandDTO>;
    waitForChange: boolean;
  }): Promise<boolean> {
    let stop = false;
    await this.vm.command(
      command.command.code,
      {
        stop_processing: () => (stop = true),
        waitForChange,
      },
      command.command.logContext,
    );
    return stop;
  }
}
