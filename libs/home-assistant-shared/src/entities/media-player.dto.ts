/* eslint-disable @typescript-eslint/no-magic-numbers */
import { ApiProperty } from '@nestjs/swagger';

import { HassStateDTO } from '../hass-state.dto';

export class MediaPlayerAttributesDTO {
  public static LIST_FEATURES(
    supportedFeatures: number,
  ): `${MediaPlayerFeatures}`[] {
    const out = [];
    SUPPORTED_FEATURES.forEach((value, key) => {
      if ((supportedFeatures & value) !== 0) {
        out.push(key);
      }
    });
    return out;
  }

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

export enum MediaPlayerFeatures {
  BROWSE_MEDIA = 'BROWSE_MEDIA',
  CLEAR_PLAYLIST = 'CLEAR_PLAYLIST',
  GROUPING = 'GROUPING',
  NEXT_TRACK = 'NEXT_TRACK',
  PAUSE = 'PAUSE',
  PLAY = 'PLAY',
  PLAY_MEDIA = 'PLAY_MEDIA',
  PREVIOUS_TRACK = 'PREVIOUS_TRACK',
  REPEAT_SET = 'REPEAT_SET',
  SEEK = 'SEEK',
  SELECT_SOUND_MODE = 'SELECT_SOUND_MODE',
  SELECT_SOURCE = 'SELECT_SOURCE',
  SHUFFLE_SET = 'SHUFFLE_SET',
  STOP = 'STOP',
  TURN_OFF = 'TURN_OFF',
  TURN_ON = 'TURN_ON',
  VOLUME_MUTE = 'VOLUME_MUTE',
  VOLUME_SET = 'VOLUME_SET',
  VOLUME_STEP = 'VOLUME_STEP',
}

const SUPPORTED_FEATURES = new Map<`${MediaPlayerFeatures}`, number>([
  [MediaPlayerFeatures.PAUSE, 1],
  [MediaPlayerFeatures.SEEK, 2],
  [MediaPlayerFeatures.VOLUME_SET, 4],
  [MediaPlayerFeatures.VOLUME_MUTE, 8],
  [MediaPlayerFeatures.PREVIOUS_TRACK, 16],
  [MediaPlayerFeatures.NEXT_TRACK, 32],
  [MediaPlayerFeatures.TURN_ON, 128],
  [MediaPlayerFeatures.TURN_OFF, 256],
  [MediaPlayerFeatures.PLAY_MEDIA, 512],
  [MediaPlayerFeatures.VOLUME_STEP, 1024],
  [MediaPlayerFeatures.SELECT_SOURCE, 2048],
  [MediaPlayerFeatures.STOP, 4096],
  [MediaPlayerFeatures.CLEAR_PLAYLIST, 8192],
  [MediaPlayerFeatures.PLAY, 16_384],
  [MediaPlayerFeatures.SHUFFLE_SET, 32_768],
  [MediaPlayerFeatures.SELECT_SOUND_MODE, 65_536],
  [MediaPlayerFeatures.BROWSE_MEDIA, 131_072],
  [MediaPlayerFeatures.REPEAT_SET, 262_144],
  [MediaPlayerFeatures.GROUPING, 524_288],
]);
