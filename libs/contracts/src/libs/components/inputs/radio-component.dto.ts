import { ComponentTypes, LabelPositions } from '../enums';
import { ComponentValuesDTO } from '../include/values.dto';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class RadioComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public inline?: boolean;
  public optionsLabelPosition: LabelPositions;
  public type: ComponentTypes.radio;
  public values: ComponentValuesDTO[];

  // #endregion Object Properties
}
