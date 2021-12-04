import { AutoLogService, FetchService } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';

import { RoutineCommandTriggerRoutineDTO } from '../../contracts';

@Injectable()
export class RoutineTriggerService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: FetchService,
  ) {}

  public async activate(
    command: RoutineCommandTriggerRoutineDTO,
  ): Promise<void> {
    process.nextTick(() => {
      //
    });
  }
}
