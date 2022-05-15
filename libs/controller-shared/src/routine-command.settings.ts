import { ApiProperty } from '@nestjs/swagger';

export class RoutineCommandSettings {
  @ApiProperty()
  public description: string;
  @ApiProperty()
  public name: string;
  @ApiProperty()
  public syncOnly?: boolean;
  @ApiProperty()
  public type: string;
}
