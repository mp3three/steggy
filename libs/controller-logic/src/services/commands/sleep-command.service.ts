import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@text-based/boilerplate';
import { RoutineCommandSleepDTO } from '@text-based/controller-shared';
import { is, sleep } from '@text-based/utilities';

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
