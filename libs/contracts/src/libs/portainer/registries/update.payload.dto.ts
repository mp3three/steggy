import { AccessPolicyDTO } from '../auth';
import { QuayRegistryDataDTO } from '../misc/quay-registry-data.dto';

export class RegistryUpdatePayloadDTO {
  public authentication: boolean;
  public name: string;
  public password: string;
  public quay: QuayRegistryDataDTO;
  public teamAccessPolicies: Record<string, AccessPolicyDTO>;
  public url: string;
  public userAccessPolicies: Record<string, AccessPolicyDTO>;
  public username: string;
}
