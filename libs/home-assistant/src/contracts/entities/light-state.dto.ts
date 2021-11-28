import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString } from 'class-validator';

import { HassStateDTO } from '../hass-state.dto';

export enum LightEffectsList {
  colorloop = 'colorloop',
  random = 'random',
}

export enum ColorModes {
  // eslint-disable-next-line unicorn/prevent-abbreviations
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
  @IsNumber()
  public color_temp?: number;
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
  public max_mireds?: number;
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
  public effect_list?: LightEffectsList[];
  public max_minreds?: number;
  public min_minreds?: number;
  public supported_color_modes?: ColorModes[];
}

// const foo = {
//   result: {
//     area_id: null,
//     capabilities: {
//       effect_list: ['colorloop', 'random'],
//       max_mireds: 495,
//       min_mireds: 158,
//       supported_color_modes: ['color_temp', 'hs'],
//     },
//     config_entry_id: '2f480debe2d4fc091ffb872aaa7a9eba',
//     device_id: '4cb0e0e42d08b69222ebd0e17c5d8f31',
//     disabled_by: null,
//     entity_id: 'light.tower_right_1',
//     icon: null,
//     name: 'Tower Right: 1',
//     original_icon: null,
//     original_name: 'Tower 1',
//     platform: 'hue',
//     unique_id: '80:4b:50:ff:fe:41:6b:2c-0b',
//   },
// };
