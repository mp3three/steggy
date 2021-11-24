import { FILTER_OPERATIONS, FilterValueType } from '@ccontour/utilities';
import { ApiProperty } from '@nestjs/swagger';

export class StateChangeActivateDTO {
  @ApiProperty()
  public entity: string;
  @ApiProperty({ enum: Object.keys(FILTER_OPERATIONS) })
  public operation?: FILTER_OPERATIONS;
  @ApiProperty()
  public value?: FilterValueType | FilterValueType[];
}
