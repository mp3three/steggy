import { AutoLogService } from '@steggy/boilerplate';
import { iRoutineCommand, RoutineCommand } from '@steggy/controller-sdk';
import {
  RoutineCommandDTO,
  RoutineCommandSleepDTO,
} from '@steggy/controller-shared';
import { is, sleep } from '@steggy/utilities';

@RoutineCommand({
  description:
    'Pause processing for a period of time. Only usable with synchronous command processing',
  name: 'Sleep',
  type: 'sleep',
})
export class SleepCommandService
  implements iRoutineCommand<RoutineCommandSleepDTO>
{
  constructor(private readonly logger: AutoLogService) {}

  public async activate({
    command,
  }: {
    command: RoutineCommandDTO<RoutineCommandSleepDTO>;
  }): Promise<void> {
    if (is.number(command.command.duration)) {
      this.logger.debug(`Sleeping for {${command.command.duration}ms}`);
      await sleep(command.command.duration);
    }
  }
}
