import { ComponentTypes, LabelPositions } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class DayComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public fields: Record<'day' | 'month' | 'year', boolean>;
  public hideInputLabels: boolean;
  public inputLabelPosition: LabelPositions;
  public type: ComponentTypes.day;
  public useLocaleSettings: boolean;

  // #endregion Object Properties
}
