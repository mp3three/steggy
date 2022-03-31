import { ComponentTypes, Currency, InputFormat } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class CurrencyComponentDTO extends BaseInputComponentDTO {
  public currency: Currency;
  public inputFormat: InputFormat;
  public mask: boolean;
  public declare type: ComponentTypes.currency;

  
}
