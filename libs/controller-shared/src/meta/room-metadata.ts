import { IsEnum, IsOptional, IsString } from 'class-validator';

export class RoomMetadataDTO {
  /**
   * Notes for self / "why did I create this variable?"
   */
  @IsString()
  @IsOptional()
  public description?: string;
  @IsString()
  @IsOptional()
  public id?: string;
  @IsString()
  @IsOptional()
  public name?: string;
  @IsString({ each: true })
  @IsOptional()
  public options?: string[];
  @IsEnum(['string', 'boolean', 'number', 'enum', 'date'])
  @IsOptional()
  public type?: 'string' | 'boolean' | 'number' | 'enum' | 'date';
  @IsOptional()
  public value?: string | boolean | number | Date;
}
