import { RoutineCommandWebhookDTO } from '@automagical/controller-shared';
import { PromptService } from '@automagical/tty';
import { HTTP_METHODS, TitleCase } from '@automagical/utilities';
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
