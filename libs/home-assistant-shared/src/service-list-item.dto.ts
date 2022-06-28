import { ApiProperty } from '@nestjs/swagger';

export class ServiceListSelector {
  public boolean?: null;
  public entity?: ServiceListEntityTarget;
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
  public default?: unknown;
  public description?: string;
  public example?: string | number;
  public name?: string;
  public required?: boolean;
  public selector?: ServiceListSelector;
}

export class ServiceListEntityTarget {
  public domain?: string;
  public integration?: string;
}

export class ServiceListServiceTarget {
  public entity?: ServiceListEntityTarget;
  public integration?: string;
}

export class ServiceListField {
  public description?: string;
  public fields?: Record<string, ServiceListFieldDescription>;
  public name?: string;
  public target?: ServiceListServiceTarget;
}

export class ServiceListItemDTO {
  @ApiProperty()
  public domain: string;
  @ApiProperty()
  public services: Record<string, ServiceListField>;
}
