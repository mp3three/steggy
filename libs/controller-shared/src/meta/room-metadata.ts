import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum ROOM_METADATA_TYPES {
  string = 'string',
  boolean = 'boolean',
  number = 'number',
  enum = 'enum',
  date = 'date',
}

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
  @IsEnum(ROOM_METADATA_TYPES)
  @IsOptional()
  public type?: `${ROOM_METADATA_TYPES}`;
  @IsOptional()
  public value?: string | boolean | number | Date;
}
