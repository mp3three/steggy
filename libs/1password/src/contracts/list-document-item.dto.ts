export class ListDocumentItemDTO {
  public changerUuid: string;
  public createdAt: Date;
  public itemVersion: number;
  public overview: ListDocumentOverviewDTO;
  public templateUuid: string;
  public trashed: 'Y' | 'N';
  public updatedAt: Date;
  public vaultUuid: string;
}
export class ListDocumentOverviewDTO {
  public URLs?: string[];
  public ainfo: string;
  public bpe?: number;
  public pgrng?: boolean;
  public ps: number;
  public tags?: string[];
  public title: string;
  public url?: string;
}
