import {
  ConflictException,
  Injectable,
  NotImplementedException,
} from '@nestjs/common';
import {
  AutoLogService,
  FetchService,
  JSONFilterService,
} from '@automagical/boilerplate';
import { is } from '@automagical/utilities';

import { WebhookDTO } from '../contracts';

@Injectable()
export class WebhookService {
  constructor(
    private readonly logger: AutoLogService,
    private readonly fetchService: FetchService,
    private readonly jsonFilter: JSONFilterService,
  ) {}

  public async test(comparison: WebhookDTO): Promise<boolean> {
    const result = await this.fetchService.fetch<
      Record<string, unknown> | string
    >(comparison.fetch);
    if (comparison.compareAs === 'text') {
      if (!is.string(result)) {
        throw new ConflictException(
          `Fetch call did not return string (${typeof result}), cannot compare as string`,
        );
      }
      return this.jsonFilter.match(
        { result },
        { ...comparison.comparison, field: 'result' },
      );
    }
    if (comparison.compareAs === 'object') {
      if (!is.object(result)) {
        throw new ConflictException();
      }
      return this.jsonFilter.match(result, comparison.comparison);
    }
    throw new NotImplementedException();
  }
}
