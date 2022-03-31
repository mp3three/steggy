import { ComponentTypes } from '../enums';
import { BaseLayoutComponentDTO } from './base-layout-component.dto';

export class FieldSetComponentDTO extends BaseLayoutComponentDTO {
  public legend?: string;
  public tree?: boolean;
  public declare type: ComponentTypes.fieldset;

  
}
