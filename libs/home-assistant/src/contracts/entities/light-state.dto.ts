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
  brightness?: number;
  color_mode?: ColorModes;
  effect?: 'none';
  effect_list?: LightEffectsList[];
  friendly_name?: string;
  hs_color?: [number, number];
  max_mireds?: number;
  min_minreds?: number;
  rgb_color?: [number, number, number];
  supported_features?: number;
  xy_color?: [number, number];
}

export class LightStateDTO extends HassStateDTO<
  'on' | 'off',
  LightAttributesDTO
> {}
