import { HassStateDTO } from '../hass-state.dto';

export class FanAttributesDTO {
  area_name?: string;
  friendly_name?: string;
  integration_id?: number;
  percentage?: number;
  percentage_step?: number;
  preset_mode?: unknown;
  preset_modes?: unknown[];
  speed?: string;
  speed_list?: string[];
  supported_features?: number;
}

export class FanStateDTO extends HassStateDTO<'on' | 'off', FanAttributesDTO> {}
