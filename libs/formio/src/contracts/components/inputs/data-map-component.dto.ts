import { BaseComponentDTO } from '../base-component.dto';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class DataMapComponentDTO extends BaseComponentDTO {
  public declare input?: true;
  public valueComponent: BaseInputComponentDTO;

  
}
