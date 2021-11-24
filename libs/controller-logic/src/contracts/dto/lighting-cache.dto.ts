import { ApiProperty } from '@nestjs/swagger';
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

import { LIGHTING_MODE } from '../rooms';
// enum LIGHTING_MODE {
//   circadian = 'circadian',
//   on = 'on',
// }
export enum LightingCacheMode {
  /**
   * Circadian lighting controller owns the logic for this device currently
   */
  circadian = 'circadian',
  /**
   * The device is acknowledged as on, but nothing has control currently
   *
   * Perhaps manually turned on via home assistant or some other process
   */
  on = 'on',
}

export class LightingCacheDTO {
  @ApiProperty({})
  public brightness?: number;
  @ApiProperty({})
  public hs_color?: [number, number] | number[];
  @ApiProperty({})
  public kelvin?: number;
  @ApiProperty({ enum: Object.keys(LIGHTING_MODE) })
  public mode?: LIGHTING_MODE;
}
/**
 * Exists to satisfy swagger. Not sure how to do Record<string, LightingCacheDTO> otherwise
 */
export const LIGHTING_CACHE_SCHEMA = {
  brightness: {
    type: 'number',
  },
  hs_color: {
    items: {
      type: 'number',
    },
  },
  kelvin: {
    type: 'number',
  },
  mode: {
    enum: Object.values(LIGHTING_MODE),
    type: 'string',
  },
} as Record<string, SchemaObject>;
