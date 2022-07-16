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
  constructor(private readonly vmService: VMService) {}

  public async activate({
    command,
    waitForChange,
  }: {
    command: RoutineCommandDTO<RoutineCodeCommandDTO>;
    waitForChange: boolean;
  }): Promise<boolean> {
    let stop = false;
    await this.vmService.command(
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
