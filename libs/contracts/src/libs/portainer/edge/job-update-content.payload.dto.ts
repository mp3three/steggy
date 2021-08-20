export class JobUpdatePayloadDTO {
  // #region Object Properties

  public cronExpression?: string;
  public endpoints?: number[];
  public fileContent?: string;
  public name?: string;
  public recurring?: boolean;

  // #endregion Object Properties
}
