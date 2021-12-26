import { Injectable } from '@nestjs/common';
import { RoutineCommandStopProcessing } from '@text-based/controller-logic';
import { PromptService } from '@text-based/tty';

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
