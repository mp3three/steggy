import { FanSpeeds } from '@for-science/home-assistant';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export type FanCacheSpeeds = FanSpeeds | 'fanSpeedUp' | 'fanSpeedDown';
export class FanCacheDTO {
  @ApiProperty()
  @IsString()
  public speed: FanCacheSpeeds;
}
