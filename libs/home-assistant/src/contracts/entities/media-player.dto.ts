import { HassStateDTO } from '../hass-state.dto';

export class MediaPlayerAttributesDTO {
  device_class?: 'tv';
  friendly_name?: string;
  is_volume_muted?: boolean;
  source_list?: string[];
  supported_features?: number;
}

export class MediaPlayerStateDTO extends HassStateDTO<
  'on' | 'off',
  MediaPlayerAttributesDTO
> {}
