import { AccessPolicyDTO } from '../auth';
import { RegistryType } from '../enums';
import { GitlabRegistryDataDTO } from './gitlab-registry-data.dto';
import { QuayRegistryDataDTO } from './quay-registry-data.dto';
import { RegistryManagementConfigurationDTO } from './registry-management-configuration.dto';

export class RegistryDTO {
  // #region Object Properties

  public Authentication: boolean;
  public AuthorizedTeams: number[];
  public AuthorizedUsers: number[];
  public Gitlab: GitlabRegistryDataDTO;
  public Id: number;
  public ManagementConfiguration: RegistryManagementConfigurationDTO;
  public Name: string;
  public Password: string;
  public Quay: QuayRegistryDataDTO;
  public TeamAccessPolicies: Record<string, AccessPolicyDTO>;
  public Type: RegistryType;
  public Url: string;
  public UserAccessPolicies: Record<string, AccessPolicyDTO>;
  public Username: string;

  // #endregion Object Properties
}
