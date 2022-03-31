import { BaseComponentDTO } from '../base-component.dto';
import { ComponentTypes } from '../enums';

export class FormComponentDTO extends BaseComponentDTO {
  public form: string;
  public declare input: true;
  public declare type: ComponentTypes.form;
  public useOriginalRevision: boolean;
}
