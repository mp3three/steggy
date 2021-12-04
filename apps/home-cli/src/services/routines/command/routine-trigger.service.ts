import {
  RoutineCommandStopProcessing,
  RoutineCommandTriggerRoutineDTO,
} from '@ccontour/controller-logic';
import { PromptService } from '@ccontour/tty';
import { Injectable } from '@nestjs/common';

import { RoutineService } from '../routine.service';

@Injectable()
export class RoutineTriggerService {
  constructor(
    private readonly promptService: PromptService,
    private readonly routineService: RoutineService,
  ) {}

  public async build(
    current: Partial<RoutineCommandTriggerRoutineDTO> = {},
  ): Promise<RoutineCommandTriggerRoutineDTO> {
    const routine = await this.routineService.pickOne(current.routine);
    return { routine: routine._id };
  }
}
