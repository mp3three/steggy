import { LicenseTrackables } from '../licenses/trackables';

export class TrackedItemDTO {
  // #region Object Properties

  public _id: string;
  public enabled: boolean;
  public expires?: Date;
  public name: string;
  public owner: string;
  public reference?: string;
  public title: string;
  public type: LicenseTrackables;

  // #endregion Object Properties
}
