import { Injectable } from '@nestjs/common';
import { RoutineCommandSendNotificationDTO } from '@steggy/controller-shared';
import { PromptService } from '@steggy/tty';

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
