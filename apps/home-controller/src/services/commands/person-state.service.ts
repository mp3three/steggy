import {
  iRoutineCommand,
  PersonService,
  RoutineCommand,
} from '@steggy/controller-sdk';
import {
  RoutineCommandDTO,
  RoutineCommandPersonStateDTO,
} from '@steggy/controller-shared';

@RoutineCommand({
  description: 'Activate a previously saved person state',
  name: 'Person State',
  type: 'person_state',
})
export class PersonStateChangeCommandService
  implements iRoutineCommand<RoutineCommandPersonStateDTO>
{
  constructor(private readonly person: PersonService) {}

  public async activate({
    command,
    waitForChange,
  }: {
    command: RoutineCommandDTO<RoutineCommandPersonStateDTO>;
    waitForChange: boolean;
  }): Promise<void> {
    await this.person.activateState(command.command, waitForChange);
  }
}
