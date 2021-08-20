import { LDAPGroupSearchSettingsDTO } from './ldap-group-search-settings.dto';
import { LDAPSearchSettingsDTO } from './ldap-search.dto';
import { TLSConfigurationDTO } from './tls-config.dto';

export class LDAPSettingsDTO {
  // #region Object Properties

  public AnonymousMode: boolean;
  public AutoCreateUsers: boolean;
  public GroupSettings: LDAPGroupSearchSettingsDTO[];
  public Password: string;
  public ReaderDN: string;
  public SearchSettings: LDAPSearchSettingsDTO[];
  public StartTLS: boolean;
  public TLSConfig: TLSConfigurationDTO;
  public URL: string;

  // #endregion Object Properties
}
