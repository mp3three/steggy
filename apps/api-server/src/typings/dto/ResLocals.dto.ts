class PermissionsDTO {
  // #region Object Properties

  public admin: boolean;
  public all: boolean;
  public own: boolean;
  public self: boolean;

  // #endregion Object Properties
}
export class ResponseLocalsDTO {
  // #region Object Properties

  public permissions: PermissionsDTO;

  // #endregion Object Properties
}
