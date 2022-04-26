import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PinnedItemDTO {
  @ApiProperty()
  @IsString()
  public target: string;
  @ApiProperty()
  @IsString()
  public type: string;
}
