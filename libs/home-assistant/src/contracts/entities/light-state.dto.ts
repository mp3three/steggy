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
  public brightness?: number;
  public color_mode?: ColorModes;
  public effect?: 'none';
  public effect_list?: LightEffectsList[];
  public friendly_name?: string;
  public hs_color?: [number, number];
  public max_mireds?: number;
  public min_minreds?: number;
  public rgb_color?: [number, number, number];
  public supported_features?: number;
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
