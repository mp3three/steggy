import { AccessPolicyDTO } from '../auth';
import { AzureCredentialsDTO } from './azure-credentials.dto';
import { DockerSnapshotDTO } from './docker-snapshot.dto';
import { EndpointSecuritySettingsDTO } from './endpoint-security-settings.dto';
import { KubernetesDataDTO } from './kubernetes-data.dto';
import { TLSConfigurationDTO } from './tls-config.dto';

export class EndpointDTO {
  // #region Object Properties

  public AuthorizedTeams: number[];
  /**
   * @deprecated
   */
  public AuthorizedUsers: number[];
  public AzureCredentials: AzureCredentialsDTO;
  public ComposeSyntaxMaxVersion: string;
  public EdgeCheckinInterval: number;
  public EdgeID: string;
  public EdgeKey: string;
  public Extension: string;
  public GroupId: number;
  public Id: number;
  public Kubernetes: KubernetesDataDTO;
  public Name: string;
  public PublicURL: string;
  public Snapshot: DockerSnapshotDTO[];
  public Status: number;
  public TLS: boolean;
  public TLSCert: string;
  public TLSConfig: TLSConfigurationDTO;
  public TLSKey: string;
  public TLSert: string;
  public TagIds: number[];
  /**
   * @deprecated
   */
  public Tags: string[];
  public TeamAccessPolicies: Record<string, AccessPolicyDTO>;
  public Type: number;
  public URL: string;
  public UserAcesssPolicies: Record<string, AccessPolicyDTO>;
  public lastCheckInDate: number;
  public securitySettings: EndpointSecuritySettingsDTO;

  // #endregion Object Properties
}
