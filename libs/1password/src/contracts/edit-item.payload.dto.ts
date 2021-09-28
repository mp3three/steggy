export class EditItemPayloadDTO {
  /**
   * [section,field,value] |  [field,value]
   */
  public assignments: EditItemPayloadAssignmentDTO[];
  public ['generate-password']: GeneratePasswordDTO;
  public item: string;
  public vault: string;
}

export class EditItemPayloadAssignmentDTO {
  public field: string;
  public section?: string;
  public value: string;
}

export class GeneratePasswordDTO {
  public digits?: boolean;
  /**
   * 1-64
   */
  public length?: number;
  public letters?: boolean;
  public symbols?: boolean;
}
