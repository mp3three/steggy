import { ComparisonDTO, FetchWith, FilterDTO } from '@ccontour/utilities';

export class WebhookDTO {
  public compareAs: 'text' | 'object';
  public comparison: FilterDTO | ComparisonDTO;
  public fetch: FetchWith;
}
