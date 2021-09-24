import { HassStateDTO } from '../hass-state.dto';

export class MediaPlayerAttributesDTO {
  source_list?: string[];
  is_volume_muted?: boolean;
  friendly_name?: string;
  supported_features?: number;
  device_class?: 'tv';
}

export class MediaPlayerStateDTO extends HassStateDTO<
  'on' | 'off',
  MediaPlayerAttributesDTO
> {}
