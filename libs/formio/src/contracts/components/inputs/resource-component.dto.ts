import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class ResourceComponentDTO extends BaseInputComponentDTO {
  public template: string;
  public declare type: ComponentTypes.resource;

  
}
