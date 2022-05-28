import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

import { PIN_TYPES } from './pinned-item.dto';

export class InflatedPinDTO {
  @ApiProperty()
  @IsString()
  public description?: string;
  @ApiProperty()
  @IsString()
  public friendlyName: string[];
  @ApiProperty()
  @IsString()
  public id: string;
  @ApiProperty()
  @IsString()
  public reference?: string;
  @ApiProperty()
  @IsString()
  public type: PIN_TYPES;
}
