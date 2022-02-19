import { FetchWith } from '@automagical/boilerplate';
import { ComparisonDTO, FilterDTO } from '@automagical/utilities';

export class WebhookDTO {
  public compareAs: 'text' | 'object';
  public comparison: FilterDTO | ComparisonDTO;
  public fetch: FetchWith;
}
