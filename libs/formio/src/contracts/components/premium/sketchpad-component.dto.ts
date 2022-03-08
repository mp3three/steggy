import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class SketchpadComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public declare input: true;
  public declare type: ComponentTypes.sketchpad;

  // #endregion Object Properties
}
