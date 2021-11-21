import { RoutineCommandWebhookDTO } from '@ccontour/controller-logic';
import { PromptService } from '@ccontour/tty';
import { HTTP_METHODS, TitleCase } from '@ccontour/utilities';
import { Injectable } from '@nestjs/common';

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
