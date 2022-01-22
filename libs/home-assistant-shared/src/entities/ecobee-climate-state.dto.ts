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
  public aux_heat: 'off';
  public climaate_mode: 'Sleep';
  public current_humidity: number;
  public current_temperature: number;
  public equipment_running: string;
  public fan_min_on_time: number;
  public fan_mode: string | FanModes;
  public fan_modes: (string | `${FanModes}`)[];
  public friendly_name: string;
  public hvac_action: 'idle';
  public hvac_mode: keyof typeof HVACModes;
  public hvac_modes: (keyof typeof HVACModes)[];
  public max_temp: number;
  public min_temp: number;
  public preset_mode: string;
  public preset_modes: string[];
  public supported_features: number;
  public swing_mode: string;
  public swing_modes: string[];
  public target_temp_high: number;
  public target_temp_low: number;
  public temperature: null;
}
export class ClimateStateDTO extends HassStateDTO<
  keyof typeof HVACModes | 'unavailable',
  ClimateAttributesDTO
> {}
