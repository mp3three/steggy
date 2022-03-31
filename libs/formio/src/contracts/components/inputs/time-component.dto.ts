import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class TimeComponentDTO extends BaseInputComponentDTO {
  public inputMask: string;
  public declare type: ComponentTypes.time;

  
}
