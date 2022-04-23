import { ApiProperty } from '@nestjs/swagger';
import { IsObject } from 'class-validator';

export class DeviceTriggerActivateDTO {
  @ApiProperty()
  @IsObject()
  public trigger: string;
}
