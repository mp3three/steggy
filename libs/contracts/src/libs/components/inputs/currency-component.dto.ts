import { ComponentTypes, Currency, InputFormat } from '../enums';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class CurrencyComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public currency: Currency;
  public inputFormat: InputFormat;
  public mask: boolean;
  public type: ComponentTypes.currency;

  // #endregion Object Properties
}
