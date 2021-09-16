import { RegistryType } from '../enums';
import { GitlabRegistryDataDTO } from '../misc/gitlab-registry-data.dto';
import { QuayRegistryDataDTO } from '../misc/quay-registry-data.dto';

export class RegistryCreatePayloadDTO {
  public authentication: boolean;
  public gitlab: GitlabRegistryDataDTO;
  public name: string;
  public password: string;
  public quay: QuayRegistryDataDTO;
  public type: RegistryType[];
  public url: string;
  public username: string;
}
