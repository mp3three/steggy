import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class TagsComponentDTO extends BaseInputComponentDTO {
  public declare type: ComponentTypes.tags;

  
}
