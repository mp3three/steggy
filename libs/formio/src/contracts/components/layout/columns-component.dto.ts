import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';
import { BaseLayoutComponentDTO } from './base-layout-component.dto';

export class ColumnsComponentDTO extends BaseLayoutComponentDTO {
  public columns: { components: BaseComponentDTO[] }[];
  public declare type: ComponentTypes.columns;

  
}
