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
}

export class LightStateDTO extends HassStateDTO<
  'on' | 'off',
  LightAttributesDTO
> {}
