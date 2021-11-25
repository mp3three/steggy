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
  @ApiProperty()
  @IsNumber()
  public interval: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsArray()
  public rgb_color?: Record<'r' | 'g' | 'b', number>;
}
