import { RoutineCommandSendNotificationDTO } from '@automagical/controller-logic';
import { PromptService } from '@automagical/tty';
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
