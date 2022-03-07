import { BaseComponentDTO } from '../base-component.dto';
import { AddressProviders, ComponentTypes, InputFormat } from '../enums';
import { AddressProviderOptionsDTO } from '../include';
import { TextWidgetDTO } from '../widgets';
import { BaseInputComponentDTO } from './base-input-component.dto';

export class AddressComponentDTO extends BaseInputComponentDTO {
  // #region Object Properties

  public components?: BaseComponentDTO[];
  public inputFormat: InputFormat;
  public inputType: InputFormat;
  public map: Record<'key' | 'region', string>;
  public mask?: boolean;
  public provider: AddressProviders;
  public providerOptions: AddressProviderOptionsDTO;
  public type: ComponentTypes.address;
  public widget: TextWidgetDTO;

  // #endregion Object Properties
}