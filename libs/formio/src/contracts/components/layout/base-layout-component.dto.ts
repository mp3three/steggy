import { BaseComponentDTO } from '../base-component.dto';

export class BaseLayoutComponentDTO extends BaseComponentDTO {
  public components?: BaseComponentDTO[];
  public declare input: false;

  
}
