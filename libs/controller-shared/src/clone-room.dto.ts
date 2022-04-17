import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CloneRoomDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  public name?: string;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public omitMetadata?: boolean;
  @ApiProperty()
  @IsBoolean()
  @IsOptional()
  public omitStates?: boolean;
}
