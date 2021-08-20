import { ResourceTypes } from '../enums';

export class ResourceControlCreatePayloadDTO {
  // #region Object Properties

  public administratorsOnly: boolean;
  public public: boolean;
  public resourceID: string;
  public subResourceIDs: string[];
  public teams: number[];
  public type: ResourceTypes;
  public users: number[];

  // #endregion Object Properties
}
