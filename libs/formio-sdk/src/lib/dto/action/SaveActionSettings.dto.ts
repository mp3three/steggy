import {
  IsObjectId,
  IsOptional,
  IsString,
  ValidateNested,
} from '@automagical/validation';

export class SaveActionSettingsDTO {
  // #region Object Properties

  /**
   * Reference to the resource where the data should be ssaved
   */
  @IsObjectId()
  public resource: string;
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
   * FIXME: How does the `page#` part work? Is this the wizard? It is valid as dest or source
   */
  @IsOptional()
  @ValidateNested()
  public fields: Record<string, string>;
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
