import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNumber, IsOptional } from 'class-validator';

export class RoutineActivateOptionsDTO {
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ required: false })
  public force?: boolean;
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  public source?: string;
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  public timeout?: number;
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  public timestamp?: string;
}
