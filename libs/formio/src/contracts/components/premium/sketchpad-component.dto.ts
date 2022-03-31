import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class SketchpadComponentDTO extends BaseComponentDTO {
  public declare input: true;
  public declare type: ComponentTypes.sketchpad;
}
