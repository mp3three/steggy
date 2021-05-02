import { IsOptional, IsString, ValidateNested } from '@automagical/validation';

// {
//   resources: ["6045267faf1db665e0de9327"],
//   username: "textField",
//   password: "textField",
//   allowedAttempts: "5",
//   attemptWindow: "30",
//   lockWait: "1800",
// }
export class SaveActionSettingsDTO {
  // #region Object Properties

  /**
   * Assign this resource to property name (on resource)
   */
  @IsOptional()
  @IsString()
  public property: string;
  /**
   * Single / Simplified mapping
   *
   * destinationKey: sourceKey (ex: "email") / "data" (whole submission) / "page[0-9]+"
   *
   * FIXME: How does the `page#` part work? Is this the wizard? Valid as dest or source
   */
  @IsOptional()
  @ValidateNested()
  public fields: Record<string, string>;
  /**
   * Reference to the resource where the data will get saved
   */
  @IsString()
  public resource: string;
  /**
   * ## Transform Mappings
   *
   * Javascript code to reformat data. Available variables are `submission` and `data` (already transformed by simple mappings)
   *
   * > Example: `data = submission.data`
   */
  @IsString()
  @IsOptional()
  public transform: string;

  // #endregion Object Properties
}
