import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class SignatureComponentDTO extends BaseInputComponentDTO {
  public declare type: ComponentTypes.signature;

  
}
