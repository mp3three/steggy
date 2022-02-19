import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@automagical/boilerplate';
import { RoutineCommandStopProcessing } from '@automagical/controller-shared';

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
