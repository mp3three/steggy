import { RoutineCommandTriggerRoutineDTO } from '@automagical/controller-shared';
import { Injectable } from '@nestjs/common';

import { RoutineService } from '../routine.service';

@Injectable()
export class RoutineTriggerService {
  constructor(private readonly routineService: RoutineService) {}

  public async build(
    current: Partial<RoutineCommandTriggerRoutineDTO> = {},
  ): Promise<RoutineCommandTriggerRoutineDTO> {
    const routine = await this.routineService.pickOne(current.routine);
    return { routine: routine._id };
  }
}
