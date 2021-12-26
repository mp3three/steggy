import { ApiProperty } from '@nestjs/swagger';
import { FanSpeeds } from '@text-based/home-assistant';
import { IsString } from 'class-validator';

export type FanCacheSpeeds = FanSpeeds | 'fanSpeedUp' | 'fanSpeedDown';
export class FanCacheDTO {
  @ApiProperty()
  @IsString()
  public speed: FanCacheSpeeds;
}
