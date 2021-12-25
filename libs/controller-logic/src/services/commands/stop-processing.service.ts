import { AutoLogService } from '@text-based/utilities';
import { Injectable } from '@nestjs/common';

import { RoutineCommandStopProcessing } from '../../contracts';

@Injectable()
export class StopProcessingCommandService {
  constructor(private readonly logger: AutoLogService) {}

  public async activate(
    command: RoutineCommandStopProcessing,
  ): Promise<boolean> {
    return await false;
    command;
  }
}
