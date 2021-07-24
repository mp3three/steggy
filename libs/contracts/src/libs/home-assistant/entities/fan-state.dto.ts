import { FanSpeeds } from '../enums';
import { HassStateDTO } from '../hass-state.dto';

export class FanStateDTO extends HassStateDTO<
  'on' | 'off',
  Record<'speed', FanSpeeds>
> {}
