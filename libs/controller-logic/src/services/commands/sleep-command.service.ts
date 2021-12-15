import { AutoLogService, sleep } from '@for-science/utilities';
import { Injectable } from '@nestjs/common';

import { RoutineCommandSleepDTO } from '../../contracts';

@Injectable()
export class SleepCommandService {
  constructor(private readonly logger: AutoLogService) {}

  public async activate(command: RoutineCommandSleepDTO): Promise<void> {
    if (typeof command.duration === 'number') {
      this.logger.debug(`Sleeping for {${command.duration}ms}`);
      await sleep(command.duration);
    }
  }
}
