import { ComponentTypes } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class TimeComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public inputMask: string;
  public type: ComponentTypes.time;

  // #endregion Object Properties
}
