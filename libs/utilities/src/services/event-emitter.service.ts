import { Injectable } from '@nestjs/common';

import { EVENT_EMITTER_MAX_LISTENENERS } from '../config';
import { InjectConfig } from '../decorators/injectors';

@Injectable()
export class EventEmitterService {
  constructor(
    @InjectConfig(EVENT_EMITTER_MAX_LISTENENERS)
    public readonly maxListeners: number,
  ) {}
}
