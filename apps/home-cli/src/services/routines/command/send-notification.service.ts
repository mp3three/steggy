import { RoutineCommandSendNotificationDTO } from '@ccontour/controller-logic';
import { PromptService } from '@ccontour/tty';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SendNotificationService {
  constructor(private readonly promptService: PromptService) {}

  public async build(
    current: Partial<RoutineCommandSendNotificationDTO> = {},
  ): Promise<RoutineCommandSendNotificationDTO> {
    return {
      template: await this.promptService.editor(
        `Enter template string`,
        current.template,
      ),
    };
  }
}
