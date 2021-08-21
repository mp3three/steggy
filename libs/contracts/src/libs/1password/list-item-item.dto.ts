export class ListItemItemDTO {
  // #region Object Properties

  public changerUuid: string;
  public createdAt: Date;
  public itemVersion: number;
  public overview: ListItemOverviewDTO;
  public templateUuid: string;
  public trashed: 'Y' | 'N';
  public updatedAt: Date;
  public uuid: string;
  public vaultUuid: string;

  // #endregion Object Properties
}

export class ListItemOverviewDTO {
  // #region Object Properties

  public urls: Record<'l' | 'u', string>[];

  // #endregion Object Properties
}
