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
  min_minreds?: number;
  max_mireds?: number;
  friendly_name?: string;
  supported_features?: number;
  effect_list?: LightEffectsList[];
  brightness?: number;
  color_mode?: ColorModes;
  hs_color?: [number, number];
  rgb_color?: [number, number, number];
  xy_color?: [number, number];
  effect?: 'none';
}

export class LightStateDTO extends HassStateDTO<
  'on' | 'off',
  LightAttributesDTO
> {}
