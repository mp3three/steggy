import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class EmailComponentDTO extends BaseInputComponentDTO {
  public declare type: ComponentTypes.email;

  
}
