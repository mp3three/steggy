import { ApiProperty } from '@nestjs/swagger';

export class ActivationEventSettings {
  @ApiProperty()
  public description: string;
  @ApiProperty()
  public name: string;
  @ApiProperty()
  public type: string;
}
