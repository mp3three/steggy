import {
  IsDateString,
  IsEnum,
  IsObjectId,
  IsString,
} from '@automagical/validation';

export enum IsActive {
  inactive = '0',
  active = '1',
}
export class LicenseApiServer {
  // #region Object Properties

  @IsDateString()
  public lastCheck: string;
  @IsEnum(IsActive)
  public status: IsActive;
  @IsObjectId()
  public environmentId: string;
  @IsObjectId()
  public id: string;
  @IsObjectId()
  public mongoHash: string;
  @IsString()
  public hostName: string;

  // #endregion Object Properties
}
