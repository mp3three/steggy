import { TLSConfigurationDTO } from './tls-config.dto';

export class RegistryManagementConfigurationDTO {
  public Authentication: boolean;
  public Password: string;
  public TLSConfig: TLSConfigurationDTO;
  public Type: number;
  public Username: string;
}
