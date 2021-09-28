import { HassStateDTO } from '../hass-state.dto';

export class SwitchAttributesDTO {
  current_a?: number;
  current_power_w?: number;
  friendly_name?: string;
  today_energy_kwh?: number;
  total_energy_kwh?: number;
  voltage?: number;
}

export class SwitchStateDTO extends HassStateDTO<
  'on' | 'off',
  SwitchAttributesDTO
> {}
