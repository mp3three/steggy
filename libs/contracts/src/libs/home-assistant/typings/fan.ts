import { IsString } from '@automagical/validation';

export enum FanSpeeds {
  off = 'off',
  low = 'low',
  medium = 'medium',
  medium_high = 'medium_high',
  high = 'high',
}

export class FanCommandDto {
  // #region Object Properties

  @IsString()
  public room: string;
  @IsString()
  public speed: FanSpeeds;

  // #endregion Object Properties
}
