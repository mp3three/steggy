import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

import { DBFake } from './database-fake.dto';

export class RoleDTO extends DBFake {
  @IsBoolean()
  @IsOptional()
  public admin?: boolean;
  @IsBoolean()
  @IsOptional()
  public default?: boolean;
  @IsOptional()
  @IsNumber()
  public deleted?: number;
  @IsString()
  @IsOptional()
  public description?: string;
  @IsString()
  @IsOptional()
  public machineName?: string;
  @IsString()
  public project?: string;
  @IsString()
  public title: string;
}
