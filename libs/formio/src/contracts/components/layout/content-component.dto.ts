import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';
import { AttrsDTO as AttributesDTO } from '../include';

export class ContentComponentDTO extends BaseComponentDTO {
  public attrs?: AttributesDTO;
  public content?: string;
  public refreshOnChange?: boolean;
  public declare type: ComponentTypes.content;

  
}
