import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class EditGridComponent extends BaseComponentDTO {
  public components: BaseComponentDTO[];
  public declare input: true;
  public rowDrafts: boolean;
  public declare type: ComponentTypes.editgrid;

  
}
