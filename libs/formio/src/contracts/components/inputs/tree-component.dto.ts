import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class TreeComponentDTO extends BaseComponentDTO {
  public components: BaseComponentDTO[];
  public declare input: true;
  public tree: boolean;
  public declare type: ComponentTypes.textarea;

  
}
