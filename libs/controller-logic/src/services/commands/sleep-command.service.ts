import { Injectable } from '@nestjs/common';
import { AutoLogService, is, sleep } from '@text-based/utilities';

import { RoutineCommandSleepDTO } from '../../contracts';

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
