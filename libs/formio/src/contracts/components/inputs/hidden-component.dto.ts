import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class HiddenComponentDTO extends BaseInputComponentDTO {
  public declare type: ComponentTypes.hidden;

  
}
