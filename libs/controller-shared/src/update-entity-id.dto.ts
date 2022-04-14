import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateEntityIdDTO {
  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  public groups?: boolean;
  @ApiProperty()
  @IsString()
  public id: string;
  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  public rooms?: boolean;
  @IsBoolean()
  @ApiProperty()
  @IsOptional()
  public routines?: boolean;
}
