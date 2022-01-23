import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class ClimateCacheDTO {
  @IsString()
  @ApiProperty()
  @IsOptional()
  public mode?: string;
  @IsNumber()
  @ApiProperty()
  @IsOptional()
  public target_temp_high?: number;
  @IsNumber()
  @ApiProperty()
  @IsOptional()
  public target_temp_low?: number;
  @IsNumber()
  @ApiProperty()
  @IsOptional()
  public temperature?: number;
  @IsNumber()
  @ApiProperty()
  @IsOptional()
  public value?: number;
}
