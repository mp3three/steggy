import { FILTER_OPERATIONS, FilterValueType } from '@automagical/utilities';

export class StateChangeActivateDTO {
  public entity: string;
  public operation?: FILTER_OPERATIONS;
  public value?: FilterValueType | FilterValueType[];
}
