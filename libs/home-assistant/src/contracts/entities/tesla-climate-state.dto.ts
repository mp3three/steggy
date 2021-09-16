import { HassStateDTO } from '../hass-state.dto';

export enum TeslaHVACModes {
  heat_cool = 'heat_cool',
  off = 'off',
}

export class TeslaClimateAttributesDTO {
  public friendly_name: string;
  public hvac_modes: (keyof typeof TeslaHVACModes)[];
  public max_temp: number;
  public min_temp: number;
  public preset_modes: ['normal', 'defrost'];
  public restored: boolean;
  public supported_features: number;
}
export class TeslaClimateStateDTO extends HassStateDTO<
  keyof typeof TeslaHVACModes | 'unavailable',
  TeslaClimateAttributesDTO
> {}
