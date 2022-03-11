import { FILTER_OPERATIONS, FilterValueType } from '@automagical/utilities';
import { ApiProperty } from '@nestjs/swagger';

export class StateChangeActivateDTO {
  @ApiProperty()
  public debounce?: number;
  @ApiProperty()
  public entity: string;
  @ApiProperty()
  public id: string;
  @ApiProperty()
  public latch?: boolean;
  @ApiProperty({ enum: Object.keys(FILTER_OPERATIONS) })
  public operation?: FILTER_OPERATIONS;
  @ApiProperty()
  public value?: FilterValueType | FilterValueType[];
}
