import { AccessPolicyDTO } from '../auth';

export class EndpointGroupsDTO {
  // #region Object Properties

  public AuthorizedTeams: number[];
  public AuthorizedUsers: number[];
  public Description: string;
  public Id: number;
  public Name: string;
  public TagIds: number[];
  public TeamAccessPolicies: Record<string, AccessPolicyDTO>;
  public UserAccessPolicies: Record<string, AccessPolicyDTO>;

  // #endregion Object Properties
}
