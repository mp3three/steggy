import { HassStateDTO } from '../hass-state.dto';

export class BatteryStateDTO extends HassStateDTO<
  string,
  {
    friendly_name: string;
  }
> {}
