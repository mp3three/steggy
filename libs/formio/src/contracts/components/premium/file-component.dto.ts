import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';
import { LABEL_VALUE } from '../include';

export class FileComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public fileTypes: LABEL_VALUE[];
  public declare input: true;
  public declare type: ComponentTypes.file;
  public webcam: boolean;

  // #endregion Object Properties
}
