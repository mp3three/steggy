import { AutoLogService } from '@automagical/boilerplate';
import { RoutineCommandStopProcessing } from '@automagical/controller-shared';
import { Injectable } from '@nestjs/common';

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
