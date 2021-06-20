export class SQLConnectorActionSettingsDTO {
  // #region Object Properties

  public block: boolean;
  public fields: Record<'column' | 'field', string>[];
  public primary: string;
  public table: string;

  // #endregion Object Properties
}
