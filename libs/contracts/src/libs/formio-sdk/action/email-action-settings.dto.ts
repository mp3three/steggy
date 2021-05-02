import { IsOptional, IsString, ValidateNested } from '@automagical/validation';
// {
//   _id: "60456c47fb0a1b056ab1c346",
//   handler: ["after", "before"],
//   method: ["create", "update", "read", "delete", "index"],
//   priority: 0,
//   name: "email",
//   title: "Email",
//   settings: {
//     transport: "default",
//     from: "no-reply@form.io",
//     emails: ["to_address@test.com"],
//     sendEach: true,
//     cc: ["cc_address@test.com"],
//     bcc: ["bcc_address@test.com"],
//     subject: "New submission for {{ form.title }}.",
//     template: "https://pro.formview.io/assets/email.html",
//     message: "{{ submission(data, form.components) }}",
//     attachFiles: true,
//     attachPDF: true,
//     pdfName: "{{ form.name }}-{{ submission._id }}",
//   },
//   condition: { eq: "", value: "", custom: "" },
//   form: "60455a95fb0a1bb5e9b1c329",
//   machineName: "formio:name:email",

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
