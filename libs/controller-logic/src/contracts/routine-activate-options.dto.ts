import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, IsOptional } from 'class-validator';

export class RoutineActivateOptionsDTO {
  @IsOptional()
  @IsNumber()
  @ApiProperty({ required: false })
  public timeout?: number;
  @IsOptional()
  @IsDateString()
  @ApiProperty({ required: false })
  public timestamp?: string;
}
