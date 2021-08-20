export class JobCreateFilePayloadDTO {
  // #region Object Properties

  public cronExpression?: string;
  public endpoints?: number[];
  public file?: number[];
  public name?: string;
  public recurring?: boolean;

  // #endregion Object Properties
}
