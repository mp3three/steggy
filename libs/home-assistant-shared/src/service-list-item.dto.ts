import { ApiProperty } from '@nestjs/swagger';

import { HASS_DOMAINS } from './socket';

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
}

export class ServiceListFieldDescription {
  public description?: string;
  public name?: string;
  public selector?: ServiceListSelector;
}

export class ServiceListField {
  public advanced?: boolean;
  public description?: string;
  public example?: string | number;
  public fields?: Record<string, ServiceListFieldDescription>;
  public name?: string;
}

export class ServiceListItemDTO {
  @ApiProperty()
  public domain: `${HASS_DOMAINS}`;
  @ApiProperty()
  public services: Record<string, ServiceListField>;
}
