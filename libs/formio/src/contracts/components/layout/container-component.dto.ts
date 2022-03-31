import { ComponentTypes } from '../enums';
import { BaseLayoutComponentDTO } from './base-layout-component.dto';

export class ContainerComponentDTO extends BaseLayoutComponentDTO {
  public declare type: ComponentTypes.container;

  
}
