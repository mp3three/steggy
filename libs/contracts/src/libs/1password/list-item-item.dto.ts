export class ListItemItemDTO {
  public changerUuid: string;
  public createdAt: Date;
  public itemVersion: number;
  public overview: ListItemOverviewDTO;
  public templateUuid: string;
  public trashed: 'Y' | 'N';
  public updatedAt: Date;
  public uuid: string;
  public vaultUuid: string;
}

export class ListItemOverviewDTO {
  public urls: Record<'l' | 'u', string>[];
}
