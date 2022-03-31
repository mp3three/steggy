import { ComponentTypes } from '../enums';
import { BaseLayoutComponentDTO } from './base-layout-component.dto';

export class PanelComponentDTO extends BaseLayoutComponentDTO {
  public declare type: ComponentTypes.panel;

  
}
