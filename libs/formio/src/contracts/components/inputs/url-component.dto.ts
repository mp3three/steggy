import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class UrlComponentDTO extends BaseInputComponentDTO {
  public declare type: ComponentTypes.url;

  
}
