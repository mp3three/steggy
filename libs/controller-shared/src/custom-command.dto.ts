import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CustomCommandDTO {
  @ApiProperty()
  @IsString()
  public context: string;
  @ApiProperty()
  @IsString()
  public method: string;
}
