import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@text-based/boilerplate';
import {
  HASocketAPIService,
  NotifyDomainService,
} from '@text-based/home-assistant';

import { RoutineCommandSendNotificationDTO } from '../../contracts';

@Injectable()
export class SendNotificationService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly socketService: HASocketAPIService,
    private readonly notification: NotifyDomainService,
  ) {}

  public async activate(
    command: RoutineCommandSendNotificationDTO,
  ): Promise<void> {
    const template = await this.socketService.renderTemplate(
      command.template ?? ``,
    );
    this.logger.debug({ template }, `Sending notification`);
    await this.notification.notify(template);
  }
}
