import { ComparisonDTO, FetchWith, FilterDTO } from '@steggy/utilities';

export class WebhookDTO {
  public compareAs: 'text' | 'object';
  public comparison: FilterDTO | ComparisonDTO;
  public fetch: FetchWith;
}
