import { AutoLogService } from '@automagical/boilerplate';
import { RoutineCommandStopProcessingDTO } from '@automagical/controller-shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StopProcessingCommandService {
  constructor(private readonly logger: AutoLogService) {}

  public async activate(
    command: RoutineCommandStopProcessingDTO,
  ): Promise<boolean> {
    return await false;
    command;
  }
}
