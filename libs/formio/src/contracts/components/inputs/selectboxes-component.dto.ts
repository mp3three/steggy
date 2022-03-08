import { ComponentTypes, InputTypes, LabelPositions } from '../enums';
import { ComponentValuesDTO } from '../include/values.dto';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class SelectBoxesComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public inputType: InputTypes;
  public optionsLabelPosition?: LabelPositions;
  declare public type: ComponentTypes.selectboxes;
  public values?: ComponentValuesDTO[];

  // #endregion Object Properties
}
