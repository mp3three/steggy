import { ComparisonDTO } from '@text-based/utilities';

import { RoutineCommandWebhookDTO } from './routine-command.dto';

export enum STOP_PROCESSING_TYPE {
  attribute = 'attribute',
  date = 'date',
  state = 'state',
  template = 'template',
  webhook = 'webhook',
}

export class RoutineStateComparisonDTO extends ComparisonDTO {
  public entity_id: string;
}
export class RoutineAttributeComparisonDTO extends ComparisonDTO {
  public attribute: string;
  public entity_id: string;
}

export class RoutineWebhookComparisonDTO extends ComparisonDTO {
  public handleAs: 'text' | 'json';
  public property?: string;
  public webhook: RoutineCommandWebhookDTO;
}

export class RoutineTemplateComparisonDTO extends ComparisonDTO {
  public template: string;
}

export class RoutineRelativeDateComparisonDTO {
  public expression: string;
}

export type STOP_PROCESSING_DEFINITIONS =
  | RoutineStateComparisonDTO
  | RoutineAttributeComparisonDTO
  | RoutineWebhookComparisonDTO
  | RoutineTemplateComparisonDTO
  | RoutineRelativeDateComparisonDTO;

export class RoutineComparisonDTO {
  public comparison: STOP_PROCESSING_DEFINITIONS;
  public type: STOP_PROCESSING_TYPE;
}
export class RoutineCommandStopProcessing {
  public comparisons: RoutineComparisonDTO;
  public mode: 'all' | 'any';
}
