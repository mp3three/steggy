import { HassStateDTO } from '../hass-state.dto';

export class LightStateDTO extends HassStateDTO<
  'on' | 'off',
  Record<'brightness', number>
> {}
