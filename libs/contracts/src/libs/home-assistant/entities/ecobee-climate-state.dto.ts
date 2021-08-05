import { HassStateDTO } from '../hass-state.dto';

export enum EcobeeHVACModes {
  heat_cool = 'heat_cool',
  heat = 'heat',
  cool = 'cool',
  off = 'off',
}
export enum EcoveeFanModes {
  auto = 'auto',
  on = 'on',
}

export class EcobeeClimateAttributesDTO {
  // #region Object Properties

  public aux_heat: 'off';
  public climaate_mode: 'Sleep';
  public current_humidity: number;
  public current_temperature: number;
  public equipment_running: string;
  public fan_min_on_time: number;
  public fan_mode: EcoveeFanModes;
  public fan_modes: (keyof EcoveeFanModes)[];
  public friendly_name: string;
  public hvac_action: 'idle';
  public hvac_modes: (keyof typeof EcobeeHVACModes)[];
  public max_temp: number;
  public min_temp: number;
  public preset_mode: string;
  public preset_modes: string[];
  public supported_features: number;
  public target_temp_high: number;
  public target_temp_low: number;
  public temperature: null;

  // #endregion Object Properties
}
export class EcobeeClimateStateDTO extends HassStateDTO<
  keyof typeof EcobeeHVACModes | 'unavailable',
  EcobeeClimateAttributesDTO
> {}
