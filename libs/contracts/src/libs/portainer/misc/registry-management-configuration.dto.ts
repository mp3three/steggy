import { TLSConfigurationDTO } from './tls-config.dto';

export class RegistryManagementConfigurationDTO {
  // #region Object Properties

  public Authentication: boolean;
  public Password: string;
  public TLSConfig: TLSConfigurationDTO;
  public Type: number;
  public Username: string;

  // #endregion Object Properties
}
