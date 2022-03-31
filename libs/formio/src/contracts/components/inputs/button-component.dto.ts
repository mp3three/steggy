import { BaseInputComponentDTO } from './base-input-component.dto';

export class ButtonComponentDTO extends BaseInputComponentDTO {
  public action?: string;
  public block?: boolean;
  public disableOnInvalid?: boolean;

  
}
