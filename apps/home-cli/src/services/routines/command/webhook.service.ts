import { Injectable } from '@nestjs/common';
import { RoutineCommandWebhookDTO } from '@text-based/controller-logic';
import { PromptService } from '@text-based/tty';
import { HTTP_METHODS, TitleCase } from '@text-based/utilities';

@Injectable()
export class WebhookService {
  constructor(private readonly promptService: PromptService) {}

  public async build(
    current: Partial<RoutineCommandWebhookDTO> = {},
  ): Promise<RoutineCommandWebhookDTO> {
    return {
      method: await this.promptService.pickOne(
        `Method`,
        Object.values(HTTP_METHODS).map((i) => [TitleCase(i), i]),
      ),
      url: await this.promptService.string(`URL`, current.url),
    };
  }
}
