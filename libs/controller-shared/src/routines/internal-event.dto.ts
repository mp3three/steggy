import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Matches } from 'class-validator';

export class InternalEventActivateDTO {
  @IsString()
  @ApiProperty()
  public event: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  @Matches(new RegExp('^[A-Za-z0-9_-]*$', 'g'))
  public logContext?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  public validate?: string;
}
