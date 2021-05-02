import { IsDateString, IsEnum, IsString } from '@automagical/validation';

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
  @IsString()
  public environmentId: string;
  @IsString()
  public hostName: string;
  @IsString()
  public id: string;
  @IsString()
  public mongoHash: string;

  // #endregion Object Properties
}
