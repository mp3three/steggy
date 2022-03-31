import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class PasswordComponentDTO extends BaseInputComponentDTO {
  public declare protected: true;
  public declare type: ComponentTypes.password;

  
}
