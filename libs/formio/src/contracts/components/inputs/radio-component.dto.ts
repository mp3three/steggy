import { ComponentTypes, LabelPositions } from '../enums';
import { ComponentValuesDTO } from '../include/values.dto';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class RadioComponentDTO extends BaseInputComponentDTO {
  public inline?: boolean;
  public optionsLabelPosition: LabelPositions;
  public declare type: ComponentTypes.radio;
  public values: ComponentValuesDTO[];

  
}
