import { HassStateDTO } from '../hass-state.dto';

export class SwitchAttributesDTO {
  current_power_w?: number;
  total_energy_kwh?: number;
  voltage?: number;
  current_a?: number;
  today_energy_kwh?: number;
  friendly_name?: string;
}

export class SwitchStateDTO extends HassStateDTO<
  'on' | 'off',
  SwitchAttributesDTO
> {}
