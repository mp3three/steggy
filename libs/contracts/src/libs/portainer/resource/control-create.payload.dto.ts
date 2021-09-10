import { ResourceTypes } from '../enums';

export class ResourceControlCreatePayloadDTO {
  public administratorsOnly: boolean;
  public public: boolean;
  public resourceID: string;
  public subResourceIDs: string[];
  public teams: number[];
  public type: ResourceTypes;
  public users: number[];
}
