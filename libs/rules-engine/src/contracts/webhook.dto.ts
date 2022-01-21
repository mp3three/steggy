import { FetchWith } from '@text-based/boilerplate';
import { ComparisonDTO, FilterDTO } from '@text-based/utilities';

export class WebhookDTO {
  public compareAs: 'text' | 'object';
  public comparison: FilterDTO | ComparisonDTO;
  public fetch: FetchWith;
}
