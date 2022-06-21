import { ApiProperty } from '@nestjs/swagger';

export class ServiceListSelector {
  public boolean?: null;
  public entity?: {
    domain?: string;
    integration?: string;
  };
  public number?: {
    max: number;
    min: number;
    mode?: string;
    step?: number;
    unit_of_measurement: string;
  };
  public object?: null;
  public select?: {
    options: Record<'label' | 'value', string>[] | string[];
  };
  public text?: null;
  public time?: null;
}

export class ServiceListFieldDescription {
  public advanced?: boolean;
  public description?: string;
  public name?: string;
  public selector?: ServiceListSelector;
}

export class ServiceListField {
  public description?: string;
  public example?: string | number;
  public fields?: Record<string, ServiceListFieldDescription>;
  public name?: string;
}

export class ServiceListItemDTO {
  @ApiProperty()
  public domain: string;
  @ApiProperty()
  public services: Record<string, ServiceListField>;
}
