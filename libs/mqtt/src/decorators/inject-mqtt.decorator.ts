import { Inject } from '@nestjs/common';

import { MQTT_CLIENT_INSTANCE } from '../contracts';

export function InjectMQTT(): ReturnType<typeof Inject> {
  return Inject(MQTT_CLIENT_INSTANCE);
}
