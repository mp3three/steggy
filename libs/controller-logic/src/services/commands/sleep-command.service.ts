import { AutoLogService } from '@automagical/boilerplate';
import { RoutineCommandSleepDTO } from '@automagical/controller-shared';
import { is, sleep } from '@automagical/utilities';
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
