import { RoutineCommandWebhookDTO } from '@steggy/controller-shared';
import { PromptService } from '@steggy/tty';
import { HTTP_METHODS, TitleCase } from '@steggy/utilities';
import { Injectable } from '@nestjs/common';

@Injectable()
export class WebhookService {
  constructor(private readonly promptService: PromptService) {}

  public async build(
    current: Partial<RoutineCommandWebhookDTO> = {},
  ): Promise<RoutineCommandWebhookDTO> {
    return {
      // TODO
      headers: [],
      method: await this.promptService.pickOne(
        `Method`,
        Object.values(HTTP_METHODS).map(i => [TitleCase(i), i]),
      ),
      url: await this.promptService.string(`URL`, current.url),
    };
  }
}
