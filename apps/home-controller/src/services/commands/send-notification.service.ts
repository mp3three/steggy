import { Injectable } from '@nestjs/common';
import { AutoLogService } from '@steggy/boilerplate';
import { RoutineCommandSendNotificationDTO } from '@steggy/controller-shared';
import {
  HASocketAPIService,
  NotifyDomainService,
} from '@steggy/home-assistant';
import { is } from '@steggy/utilities';

import { VMService } from '../vm.service';

@Injectable()
export class SendNotificationService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly socketService: HASocketAPIService,
    private readonly notification: NotifyDomainService,
    private readonly vmService: VMService,
  ) {}

  public async activate(
    command: RoutineCommandSendNotificationDTO,
    waitForChange = false,
    runId?: string,
  ): Promise<void> {
    const message = await this.buildMessage(command, runId);
    this.logger.debug({ message }, `Sending notification`);
    await this.notification.notify(message, undefined, waitForChange);
  }

  private async buildMessage(
    command: RoutineCommandSendNotificationDTO,
    runId: string,
  ): Promise<string> {
    const type = command.type ?? 'simple';
    if (type === 'simple') {
      return command.template;
    }
    if (type === 'template') {
      return await this.socketService.renderTemplate(command.template ?? ``);
    }
    const result = await this.vmService.exec(command.template, {
      runId,
    });
    if (!is.string(result)) {
      this.logger.error(
        { command, result },
        `Code did not return string result`,
      );
      return ``;
    }
    return result;
  }
}
