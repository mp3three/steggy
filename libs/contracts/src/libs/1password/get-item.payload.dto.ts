export class GetItemPayloadDTO {
  // #region Object Properties

  public item: string;
  public fields?: string[];
  public format?: 'JSON' | 'CSV';
  public ['include-archive']?: boolean;
  public ['share-link']?: boolean;
  public vault?: string;

  // #endregion Object Properties
}
