import { RoutineCommandSendNotificationDTO } from '@text-based/controller-logic';
import { PromptService } from '@text-based/tty';

import { RoutineCommand } from '../../../decorators';

@RoutineCommand({
  type: 'send_notification',
})
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
