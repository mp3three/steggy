import { Injectable } from '@nestjs/common';
import { RoutineCommandTriggerRoutineDTO } from '@text-based/controller-logic';
import { PromptService } from '@text-based/tty';

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
