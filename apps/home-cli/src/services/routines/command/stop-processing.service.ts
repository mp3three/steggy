import { RoutineCommandStopProcessing } from '@text-based/controller-logic';
import { PromptService } from '@text-based/tty';

import { RoutineCommand } from '../../../decorators';

@RoutineCommand({
  type: 'stop_processing',
})
export class StopProcessingService {
  constructor(private readonly promptService: PromptService) {}

  public async build(
    current: Partial<RoutineCommandStopProcessing> = {},
  ): Promise<RoutineCommandStopProcessing> {
    return current as RoutineCommandStopProcessing;
  }

  public async header(current: RoutineCommandStopProcessing): Promise<string> {
    return await ``;
  }
}
