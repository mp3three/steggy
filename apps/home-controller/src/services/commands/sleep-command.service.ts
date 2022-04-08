import { AutoLogService } from '@steggy/boilerplate';
import { RoutineCommandSleepDTO } from '@steggy/controller-shared';
import { is, sleep } from '@steggy/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SleepCommandService {
  constructor(private readonly logger: AutoLogService) {}

  public async activate(command: RoutineCommandSleepDTO): Promise<void> {
    if (is.number(command.duration)) {
      this.logger.debug(`Sleeping for {${command.duration}ms}`);
      await sleep(command.duration);
    }
  }
}
