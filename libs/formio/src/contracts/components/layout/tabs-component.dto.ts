import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class TabComponentTabDTO {
  public components: BaseComponentDTO[];
  public key: string;
  public label: string;

  
}

export class TabComponentDTO extends BaseComponentDTO {
  /**
   * Array of components inside a row / col grid
   */
  public components?: TabComponentTabDTO;
  public declare input: false;
  public declare type: ComponentTypes.tabs;

  
}
