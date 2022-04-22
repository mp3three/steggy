import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

import { MetadataComparisonDTO } from './stop-processing.dto';

export class MetadataChangeDTO extends MetadataComparisonDTO {
  @IsBoolean()
  @ApiProperty()
  public latch: boolean;
}
