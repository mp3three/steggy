import { ApiProperty } from '@nestjs/swagger';

import { HassStateDTO } from '../hass-state.dto';

export class MediaPlayerAttributesDTO {
  @ApiProperty({ required: false })
  public bass_level?: number;
  @ApiProperty({ required: false })
  public device_class?: 'tv';
  @ApiProperty({ required: false })
  public friendly_name?: string;
  @ApiProperty({ required: false })
  public is_volume_muted?: boolean;
  @ApiProperty({ required: false })
  public media_content_type?: 'music';
  @ApiProperty({ required: false })
  public repeat?: 'on' | 'off';
  @ApiProperty({ required: false })
  public shuffle?: boolean;
  @ApiProperty({ required: false })
  public source_list?: string[];
  @ApiProperty({ required: false })
  public supported_features?: number;
  @ApiProperty({ required: false })
  public trebel_volume?: number;
  @ApiProperty({ required: false })
  public volume_level?: number;
}

export class MediaPlayerStateDTO extends HassStateDTO<
  'on' | 'off',
  MediaPlayerAttributesDTO
> {}
