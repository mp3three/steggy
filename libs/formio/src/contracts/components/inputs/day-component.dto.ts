import { ComponentTypes, LabelPositions } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class DayComponentDTO extends BaseInputComponentDTO {
  public fields: Record<'day' | 'month' | 'year', boolean>;
  public hideInputLabels: boolean;
  public inputLabelPosition: LabelPositions;
  public declare type: ComponentTypes.day;
  public useLocaleSettings: boolean;

  
}
