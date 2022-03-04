import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class SketchpadComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public input: true;
  public type: ComponentTypes.sketchpad;

  // #endregion Object Properties
}
