import { ApiProperty } from '@nestjs/swagger';

import { StateChangeActivateDTO } from './state-change-activate.dto';

export class AttributeChangeActivateDTO extends StateChangeActivateDTO {
  @ApiProperty()
  public attribute: string;
}
