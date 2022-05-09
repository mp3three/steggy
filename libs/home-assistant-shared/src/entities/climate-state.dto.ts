/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString } from 'class-validator';

import { HassStateDTO } from '../hass-state.dto';

export enum HVACModes {
  heat_cool = 'heat_cool',
  heat = 'heat',
  cool = 'cool',
  off = 'off',
}
export enum FanModes {
  auto = 'auto',
  on = 'on',
}

export class ClimateAttributesDTO {
  public static LIST_FEATURES(
    supportedFeatures: number,
  ): `${ClimateFeatures}`[] {
    const out = [];
    SUPPORTED_FEATURES.forEach((value, key) => {
      if ((supportedFeatures & value) !== 0) {
        out.push(key);
      }
    });
    return out;
  }

  @IsString()
  @ApiProperty()
  @IsOptional()
  public aux_heat?: 'off';

  @IsString()
  @ApiProperty()
  @IsOptional()
  public climate_mode?: 'Sleep';

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  public current_humidity?: number;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  public current_temperature?: number;

  @IsString()
  @ApiProperty()
  @IsOptional()
  public equipment_running?: string;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  public fan_min_on_time?: number;

  @IsString()
  @ApiProperty()
  @IsOptional()
  public fan_mode?: string | FanModes;

  @IsString({ each: true })
  @ApiProperty()
  @IsOptional()
  public fan_modes?: (string | `${FanModes}`)[];

  @ApiProperty()
  @IsOptional()
  public friendly_name?: string;

  @ApiProperty()
  @IsOptional()
  public hvac_action?: 'idle';

  @IsString()
  @ApiProperty()
  @IsOptional()
  public hvac_mode?: keyof typeof HVACModes;

  @IsString({ each: true })
  @ApiProperty()
  @IsOptional()
  public hvac_modes?: (keyof typeof HVACModes)[];

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  public max_temp?: number;

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  public min_temp?: number;

  @IsString()
  @ApiProperty()
  @IsOptional()
  public preset_mode?: string;

  @ApiProperty()
  @IsOptional()
  public preset_modes?: string[];

  @IsNumber()
  @ApiProperty()
  @IsOptional()
  public supported_features?: number;

  @IsString()
  @ApiProperty()
  @IsOptional()
  public swing_mode?: string;

  @IsString({ each: true })
  @ApiProperty()
  @IsOptional()
  public swing_modes?: string[];

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
}

export class ClimateStateDTO extends HassStateDTO<
  keyof typeof HVACModes | 'unavailable',
  ClimateAttributesDTO
> {}

export enum ClimateFeatures {
  TARGET_TEMPERATURE = 'TARGET_TEMPERATURE',
  TARGET_TEMPERATURE_RANGE = 'TARGET_TEMPERATURE_RANGE',
  TARGET_HUMIDITY = 'TARGET_HUMIDITY',
  FAN_MODE = 'FAN_MODE',
  PRESET_MODE = 'PRESET_MODE',
  SWING_MODE = 'SWING_MODE',
  AUX_HEAT = 'AUX_HEAT',
}

const SUPPORTED_FEATURES = new Map([
  [ClimateFeatures.TARGET_TEMPERATURE, 1],
  [ClimateFeatures.TARGET_TEMPERATURE_RANGE, 2],
  [ClimateFeatures.TARGET_HUMIDITY, 4],
  [ClimateFeatures.FAN_MODE, 8],
  [ClimateFeatures.PRESET_MODE, 16],
  [ClimateFeatures.SWING_MODE, 32],
  [ClimateFeatures.AUX_HEAT, 64],
]);
