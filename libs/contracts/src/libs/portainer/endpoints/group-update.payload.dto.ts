import { AccessPolicyDTO } from '../auth';

export class EndpointGroupUpdatePayloadDTO {
  // #region Object Properties

  public description?: string;
  /**
   * @example my-endpoint-group
   */
  public name?: string;
  public teamAccessPolicies?: Record<string, AccessPolicyDTO>;
  public userAccessPolicies?: Record<string, AccessPolicyDTO>;

  // #endregion Object Properties
}
