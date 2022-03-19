import { AutoLogService } from '@automagical/boilerplate';
import { RoutineCommandSendNotificationDTO } from '@automagical/controller-shared';
import {
  HASocketAPIService,
  NotifyDomainService,
} from '@automagical/home-assistant';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SendNotificationService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly socketService: HASocketAPIService,
    private readonly notification: NotifyDomainService,
  ) {}

  public async activate(
    command: RoutineCommandSendNotificationDTO,
    waitForChange = false,
  ): Promise<void> {
    const template = await this.socketService.renderTemplate(
      command.template ?? ``,
    );
    this.logger.debug({ template }, `Sending notification`);
    await this.notification.notify(template, undefined, waitForChange);
  }
}
