import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from '../inputs';

export class CustomComponentDTO extends BaseInputComponentDTO {
  public declare type: ComponentTypes.custom;
}
