import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RelatedDescriptionDTO {
  @IsString({ each: true })
  @ApiProperty()
  public area: string[];
  @IsString({ each: true })
  @ApiProperty()
  public config_entry: string[];
  @IsString({ each: true })
  @ApiProperty()
  public device?: string[];
  @IsString({ each: true })
  @ApiProperty()
  public entity: string[];
}
