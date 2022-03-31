import { ComponentTypes, InputTypes, LabelPositions } from '../enums';
import { ComponentValuesDTO } from '../include/values.dto';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class SelectBoxesComponentDTO extends BaseInputComponentDTO {
  public inputType: InputTypes;
  public optionsLabelPosition?: LabelPositions;
  public declare type: ComponentTypes.selectboxes;
  public values?: ComponentValuesDTO[];

  
}
