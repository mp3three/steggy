import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class FormComponentDTO extends BaseComponentDTO {
  // #region Object Properties

  public form: string;
  public declare input: true;
  public declare type: ComponentTypes.form;
  public useOriginalRevision: boolean;

  // #endregion Object Properties
}
