import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class InternalEventActivateDTO {
  @IsString()
  @ApiProperty()
  public event: string;
  @IsString()
  @IsOptional()
  @ApiProperty()
  public validate?: string;
}
