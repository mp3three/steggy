import { FanSpeeds } from '../enums';
import { HassStateDTO } from '../hass-state.dto';

export class FanAttributesDTO {
  speed_list?: FanSpeeds[];
  preset_modes?: unknown[];
  speed?: FanSpeeds;
  percentage?: number;
  percentage_step?: 25;
  preset_mode?: unknown;
  integration_id?: number;
  area_name?: string;
  friendly_name?: string;
  supported_features?: number;
}

export class FanStateDTO extends HassStateDTO<'on' | 'off', FanAttributesDTO> {}
