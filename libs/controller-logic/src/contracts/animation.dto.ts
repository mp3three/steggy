import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class FlashAnimationDTO {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  public brightness?: number;
  @ApiProperty()
  @IsNumber()
  public duration: number;
  @ApiProperty()
  @IsString()
  public entity_id: string;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  public hs_color?: [number, number];
  @ApiProperty()
  @IsNumber()
  public interval: number;
}
