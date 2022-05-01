import { ColorModes, LightAttributesDTO } from './entities';

export class UpdateEntityResponseDTO {
  area_id: string;
  capabilities: Pick<
    LightAttributesDTO,
    'min_minreds' | 'max_minreds' | 'effect_list'
  > & { supported_color_modes: ColorModes[] };
  config_entry_id: string;
  device_id: string;
  disabled_by: string;
  entity_id: string;
  icon: string;
  name: string;
  original_icon: string;
  original_name: string;
  platform: string;
  unique_id: string;
}
