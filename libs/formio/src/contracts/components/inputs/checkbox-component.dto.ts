import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class CheckboxComponentDTO extends BaseInputComponentDTO {
  public declare type: ComponentTypes.checkbox;

  
}
