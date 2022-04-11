import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

import { RoomMetadataComparisonDTO } from './stop-processing.dto';

export class MetadataChangeDTO extends RoomMetadataComparisonDTO {
  @IsBoolean()
  @ApiProperty()
  public latch: boolean;
}
