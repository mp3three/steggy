import {
  EntityCommandRouterService,
  iRoutineCommand,
  RoutineCommand,
} from '@steggy/controller-sdk';
import {
  GeneralSaveStateDTO,
  RoutineCommandDTO,
} from '@steggy/controller-shared';

@RoutineCommand({
  description: 'Change an entity state',
  name: 'Entity State',
  type: 'entity_state',
})
export class EntityStateChangeCommandService
  implements iRoutineCommand<GeneralSaveStateDTO>
{
  constructor(private readonly entityRouter: EntityCommandRouterService) {}

  public async activate({
    command,
    waitForChange,
  }: {
    command: RoutineCommandDTO<GeneralSaveStateDTO>;
    waitForChange: boolean;
  }): Promise<void> {
    await this.entityRouter.fromState(command.command, waitForChange);
  }
}
