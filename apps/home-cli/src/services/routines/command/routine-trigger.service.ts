import { Injectable } from '@nestjs/common';
import { RoutineCommandTriggerRoutineDTO } from '@steggy/controller-shared';

import { RoutineService } from '../routine.service';

@Injectable()
export class RoutineTriggerService {
  constructor(private readonly routineService: RoutineService) {}

  public async build(
    current: Partial<RoutineCommandTriggerRoutineDTO> = {},
  ): Promise<RoutineCommandTriggerRoutineDTO> {
    const routine = await this.routineService.pickOne(current.routine);
    return { force: false, routine: routine._id };
  }
}
