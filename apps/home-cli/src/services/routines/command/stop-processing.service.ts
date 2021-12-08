import { RoutineCommandStopProcessing } from '@ccontour/controller-logic';
import { PromptService } from '@ccontour/tty';
import { Injectable } from '@nestjs/common';

@Injectable()
export class StopProcessingService {
  constructor(private readonly promptService: PromptService) {}

  public async build(
    current: Partial<RoutineCommandStopProcessing> = {},
  ): Promise<RoutineCommandStopProcessing> {
    return {
      // template: await this.promptService.editor(
      //   `Enter template string`,
      //   current.template,
      // ),
    };
  }

  public async header(current: RoutineCommandStopProcessing): Promise<string> {
    return await ``;
  }
}
