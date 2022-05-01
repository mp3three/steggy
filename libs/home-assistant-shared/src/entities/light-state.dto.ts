import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { HassStateDTO } from '../hass-state.dto';

export enum LightEffectsList {
  colorloop = 'colorloop',
  random = 'random',
}

export enum ColorModes {
  color_temp = 'color_temp',
  hs = 'hs',
}

export class LightAttributesDTO {
  @ApiProperty({ required: false })
  @IsNumber()
  public brightness?: number;
  @ApiProperty({ required: false })
  @IsEnum(ColorModes)
  public color_mode?: ColorModes;
  @ApiProperty({ required: false })
  @IsString()
  public effect?: 'none';
  @ApiProperty({ required: false })
  @IsEnum(LightEffectsList, { each: true })
  public effect_list?: LightEffectsList[];
  @ApiProperty({ required: false })
  @IsString()
  public friendly_name?: string;
  @ApiProperty({ required: false })
  public hs_color?: [number, number];
  @ApiProperty({ required: false })
  @IsNumber()
  public kelvin?: number;
  @ApiProperty({ required: false })
  @IsNumber()
  public max_minreds?: number;
  @ApiProperty({ required: false })
  @IsNumber()
  public min_minreds?: number;
  @ApiProperty({ required: false })
  public rgb_color?: [number, number, number];
  @ApiProperty({ required: false })
  @IsNumber()
  public supported_features?: number;
  @ApiProperty({ required: false })
  public xy_color?: [number, number];
}

export class LightStateDTO extends HassStateDTO<
  'on' | 'off',
  LightAttributesDTO
> {}

export class LightCapabilities {
  @ValidateNested({ each: true })
  @ApiProperty({ required: false })
  @IsOptional()
  public effect_list?: LightEffectsList[];
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  public max_minreds?: number;
  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  public min_minreds?: number;
  @ValidateNested({ each: true })
  @ApiProperty({ required: false })
  @IsOptional()
  public supported_color_modes?: ColorModes[];
}
