import { AccessPolicyDTO } from '../auth';
import { KubernetesDataDTO } from '../misc';

export class EndpointUpdatePayloadDTO {
  // #region Object Properties

  public azureApplicationID: string;
  public azureAuthenticationKey: string;
  public azureTenantID: string;
  public edgeCheckinInterval: number;
  public groupID: number;
  public kubernetes: KubernetesDataDTO;
  public name: string;
  public publicURL: string;
  public status: number;
  public tagIDs: number[];
  public teamAccessPolicies: Record<string, AccessPolicyDTO>;
  public tls: boolean;
  public tlsskipClientVerify: boolean;
  public tlsskipVerify: boolean;
  public url: string;
  public userAccessPolicies: Record<string, AccessPolicyDTO>;

  // #endregion Object Properties
}
