import { FanSpeeds } from '@ccontour/home-assistant';

export type FanCacheSpeeds = FanSpeeds | 'fanSpeedUp' | 'fanSpeedDown';
export class FanCacheDTO {
  public speed: FanCacheSpeeds;
}
