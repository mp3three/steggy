import { AutoLogService, FetchService } from '@steggy/boilerplate';
import { RoutineCommandWebhookDTO } from '@steggy/controller-shared';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: FetchService,
  ) {}

  public async activate(command: RoutineCommandWebhookDTO): Promise<void> {
    this.logger.debug({ command }, `Sending webhook`);
    await this.fetchService.fetch({
      method: command.method,
      url: command.url,
    });
  }
}
