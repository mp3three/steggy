import {
  GroupService,
  iRoutineCommand,
  RoutineCommand,
} from '@steggy/controller-sdk';
import {
  RoutineCommandDTO,
  RoutineCommandGroupStateDTO,
} from '@steggy/controller-shared';

@RoutineCommand({
  description: 'Activate a previously saved group state',
  name: 'Group State',
  type: 'group_state',
})
export class GroupStateChangeCommandService
  implements iRoutineCommand<RoutineCommandGroupStateDTO>
{
  constructor(private readonly group: GroupService) {}

  public async activate({
    command,
    waitForChange,
  }: {
    command: RoutineCommandDTO<RoutineCommandGroupStateDTO>;
    waitForChange: boolean;
  }): Promise<void> {
    await this.group.activateState(command.command, waitForChange);
  }
}
