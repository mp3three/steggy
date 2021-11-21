import {
  HASocketAPIService,
  NotifyDomainService,
} from '@automagical/home-assistant';
import { AutoLogService } from '@automagical/utilities';
import { Injectable } from '@nestjs/common';

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