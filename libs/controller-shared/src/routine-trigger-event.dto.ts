import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class RoutineTriggerEvent {
  @IsString()
  @ApiProperty()
  public routine: string;
  @IsString()
  @ApiProperty()
  public runId: string;
  @IsString()
  @ApiProperty()
  public source: string;
  @IsNumber()
  @ApiProperty()
  public time: number;
}
