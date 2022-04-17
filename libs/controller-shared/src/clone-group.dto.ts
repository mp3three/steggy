import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CloneGroupDTO {
  @IsOptional()
  @ApiProperty()
  @IsString()
  public name?: string;
  @IsOptional()
  @IsBoolean()
  @ApiProperty()
  public omitStates?: boolean;
}
