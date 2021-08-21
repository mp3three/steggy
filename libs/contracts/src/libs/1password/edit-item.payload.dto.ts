export class EditItemPayloadDTO {
  // #region Object Properties

  /**
   * [section,field,value] |  [field,value]
   */
  public assignments: EditItemPayloadAssignmentDTO[];
  public item: string;
  public vault: string;
  public ['generate-password']: GeneratePasswordDTO;

  // #endregion Object Properties
}

export class EditItemPayloadAssignmentDTO {
  public section?: string;
  public field: string;
  public value: string;
}

export class GeneratePasswordDTO {
  public letters?: boolean;
  public digits?: boolean;
  public symbols?: boolean;
  /**
   * 1-64
   */
  public length?: number;
}
