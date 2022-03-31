import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class TextAreaComponentDTO extends BaseInputComponentDTO {
  public declare type: ComponentTypes.textarea;

  
}
