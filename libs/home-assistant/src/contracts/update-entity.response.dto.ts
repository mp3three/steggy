import { ColorModes, LightAttributesDTO } from './entities';

export class UpdateEntityResponseDTO {
  config_entry_id: string;
  device_id: string;
  area_id: string;
  disabled_by: string;
  entity_id: string;
  name: string;
  icon: string;
  platform: string;
  original_name: string;
  original_icon: string;
  unique_id: string;
  capabilities: Pick<
    LightAttributesDTO,
    'min_minreds' | 'max_mireds' | 'effect_list'
  > & { supported_color_modes: ColorModes[] };
}
