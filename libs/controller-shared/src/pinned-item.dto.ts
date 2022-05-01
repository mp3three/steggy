import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class PinnedItemDTO {
  @ApiProperty()
  @IsString()
  @IsOptional()
  public ref?: string;
  @ApiProperty()
  @IsString()
  public target: string;
  @ApiProperty()
  @IsString()
  public type: string;
}
