import { IsNumber, IsString, ValidateNested } from 'class-validator';

export class BackupContentsItem {
  @IsString()
  public collection: string;
  @IsNumber()
  public count: number;
}

export class BackupHeader {
  @ValidateNested({ each: true })
  public contents: BackupContentsItem[];
  @IsNumber()
  public timestamp: number;
}
