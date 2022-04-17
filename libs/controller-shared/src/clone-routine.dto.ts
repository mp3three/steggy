import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CloneRoutineDTO {
  @IsString()
  @IsOptional()
  @ApiProperty()
  public name?: string;
  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public noRecurse?: boolean;
  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public omitActivate?: boolean;
  @IsBoolean()
  @IsOptional()
  @ApiProperty()
  public omitCommand?: boolean;
  @IsString()
  @IsOptional()
  @ApiProperty()
  public replaceParent?: string;
}
